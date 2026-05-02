import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.model.js';
import UserModel from '../models/user.model.js';
import AddressModel from "../models/address.model.js";
import VendorModel from '../models/vendor.model.js';
import mongoose from "mongoose";
// PayPal removed - using Stripe for payments
// import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import OrderCancellationEmail from "../utils/orderCancellationEmailTemplate.js";
import AdminOrderNotificationEmail from "../utils/adminOrderNotificationEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import { calculateOrderCommissions, creditVendorBalance } from "../utils/commissionCalculator.js";
import { sendVendorNewOrder } from "../utils/vendorEmails.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createOrderController = async (request, response) => {
    let session;
    try {
        const products = Array.isArray(request.body.products) ? request.body.products : [];
        if (products.length === 0) {
            return sendError(response, 400, 'Products are required to create an order');
        }

        const isGuestOrder = request.body.isGuestOrder || (!request.userId && request.body.guestCustomer);
        if (isGuestOrder && !request.body.guestCustomer) {
            return sendError(response, 400, 'Guest customer information is required');
        }

        if (!request.body.shippingRate && !request.body.shippingMethodId) {
            return sendError(response, 400, 'Shipping method is required');
        }

        // Strict shipping/address validation before creating order
        const shippingAddressInput = request.body.shippingAddress || {};
        const addressLine1 = shippingAddressInput.addressLine1 || shippingAddressInput.address?.addressLine1 || '';
        const city = shippingAddressInput.city || shippingAddressInput.address?.city || '';
        const country = shippingAddressInput.country || shippingAddressInput.address?.country || '';
        const postalCode = shippingAddressInput.postalCode || shippingAddressInput.postal_code || shippingAddressInput.address?.postalCode || '';
        if (!addressLine1 || !city || !country || !postalCode) {
            return sendError(response, 400, 'Invalid address. Street, city, country and postal code are required.');
        }

        const idempotencyKey = request.body.idempotencyKey || null;
        if (idempotencyKey) {
            const existingOrder = await OrderModel.findOne({ idempotencyKey });
            if (existingOrder) {
                return sendSuccess(response, 200, "Order already processed", {
                    order: existingOrder,
                    orderId: existingOrder._id
                });
            }
        }

        const shippingCost = request.body.shippingCost || 0;
        const productsTotal = products.reduce((sum, item) => {
            return sum + (parseFloat(item.price || item.subTotal || 0) * (item.quantity || 1));
        }, 0);
        const calculatedTotal = productsTotal + shippingCost;
        const finalTotal = (request.body.totalAmt && request.body.totalAmt > 0)
            ? request.body.totalAmt
            : calculatedTotal;

        const rawPaymentStatus = String(request.body.payment_status || '').toLowerCase();
        const paymentState = rawPaymentStatus.includes('fail')
            ? 'failed'
            : (rawPaymentStatus.includes('paid') || rawPaymentStatus.includes('success') || rawPaymentStatus.includes('completed')
                ? 'paid'
                : 'pending');

        session = await mongoose.startSession();
        session.startTransaction();

        // Re-check stock from DB right before creating order (race-condition safe path starts here)
        for (const item of products) {
            const quantity = Number(item.quantity || 0);
            if (!item?.productId || quantity < 1) {
                throw new Error('Invalid order item payload');
            }

            const product = await ProductModel.findById(item.productId).session(session);
            if (!product) {
                throw new Error(`Product not found for item ${item.productId}`);
            }

            if (item.productType === 'variable' && item.variationId) {
                const variation = product.variations?.find(
                    v => v._id && v._id.toString() === String(item.variationId)
                );
                if (!variation) {
                    throw new Error(`Product variation not found for ${item.productTitle || item.productId}`);
                }
                if (!variation.endlessStock && Number(variation.stock || 0) < quantity) {
                    throw new Error(`Insufficient stock for ${item.productTitle || item.productId}`);
                }
            } else {
                const stock = Number(product.countInStock || product.inventory?.stock || 0);
                const endlessStock = !!product.inventory?.endlessStock;
                if (!endlessStock && stock < quantity) {
                    throw new Error(`Insufficient stock for ${item.productTitle || item.productId}`);
                }
            }
        }

        const orderShippingAddress = {
            addressLine1,
            addressLine2: shippingAddressInput.addressLine2 || shippingAddressInput.address?.addressLine2 || '',
            city,
            province: shippingAddressInput.province || shippingAddressInput.address?.province || '',
            provinceCode: shippingAddressInput.provinceCode || shippingAddressInput.province || shippingAddressInput.address?.provinceCode || '',
            postalCode,
            postal_code: shippingAddressInput.postal_code || postalCode,
            country,
            countryCode: shippingAddressInput.countryCode || shippingAddressInput.address?.countryCode || '',
            coordinates: shippingAddressInput.coordinates || shippingAddressInput.googlePlaces?.coordinates || null
        };

        let order = await OrderModel.create([{
            userId: request.userId || request.body.userId || null,
            products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status || paymentState,
            paymentState,
            idempotencyKey,
            delivery_address: request.body.delivery_address,
            totalAmt: finalTotal,
            shippingCost,
            shippingRate: request.body.shippingRate || null,
            shippingAddress: orderShippingAddress,
            phone: request.body.phone || '',
            customerName: request.body.customerName || '',
            apartmentNumber: request.body.apartmentNumber || '',
            deliveryNote: request.body.deliveryNote || '',
            date: request.body.date,
            isGuestOrder,
            guestCustomer: request.body.guestCustomer || null,
            discounts: request.body.discounts || null,
            status: 'Received',
            statusHistory: [{
                status: 'Received',
                timestamp: new Date(),
                updatedBy: request.userId || null
            }]
        }], { session });
        order = order[0];

        // ========================================
        // CALCULATE VENDOR COMMISSIONS
        // ========================================
        try {
            // Check if any products belong to vendors
            const vendorProducts = request.body.products.filter(p => p.vendor || p.vendorId);
            
            if (vendorProducts.length > 0) {
                console.log('💰 Calculating vendor commissions for', vendorProducts.length, 'vendor products');
                
                // Calculate commissions for all order items
                const commissionResult = await calculateOrderCommissions(request.body.products);
                
                // Update order products with commission info
                for (let i = 0; i < order.products.length; i++) {
                    const updatedItem = commissionResult.items.find(item => 
                        (item.productId?.toString() || item.productId) === (order.products[i].productId?.toString() || order.products[i].productId)
                    );
                    if (updatedItem) {
                        order.products[i].vendorEarning = updatedItem.vendorEarning || 0;
                        order.products[i].platformCommission = updatedItem.platformCommission || 0;
                        order.products[i].commissionRate = updatedItem.commissionRate || 15;
                    }
                }
                
                // Add vendor summary to order
                if (commissionResult.vendorSummary?.length > 0) {
                    order.vendorSummary = commissionResult.vendorSummary.map(vs => ({
                        vendor: vs.vendorId,
                        vendorShopName: vs.vendorName || '',
                        totalAmount: vs.totalAmount,
                        commission: vs.commission,
                        vendorEarning: vs.vendorEarning
                    }));
                }
                
                // Save order with commission data
                await order.save();
                console.log('✅ Order updated with commission data');
                
                // Send email notifications to vendors (non-blocking)
                for (const vendorSum of (commissionResult.vendorSummary || [])) {
                    try {
                        const vendor = await VendorModel.findById(vendorSum.vendorId);
                        if (vendor?.email) {
                            const vendorItems = order.products.filter(p => 
                                (p.vendor?.toString() || p.vendorId?.toString()) === vendorSum.vendorId.toString()
                            );
                            sendVendorNewOrder(vendor, order, vendorItems).catch(err => {
                                console.error('Failed to send vendor order notification:', err);
                            });
                        }
                    } catch (vendorEmailErr) {
                        console.error('Error sending vendor notification:', vendorEmailErr);
                    }
                }
            }
        } catch (commissionError) {
            console.error('⚠️ Commission calculation error (non-blocking):', commissionError);
            // Don't fail order creation if commission calculation fails
        }

        // Only failed payments skip stock deduction.
        const shouldAffectInventory = paymentState !== 'failed';
        
        if (shouldAffectInventory) {
            for (let i = 0; i < products.length; i++) {
                const orderProduct = products[i];
                const qty = Number(orderProduct.quantity || 0);
                if (qty < 1) {
                    throw new Error(`Invalid quantity for ${orderProduct.productTitle || orderProduct.productId}`);
                }

                if (orderProduct.productType === 'variable' && orderProduct.variationId) {
                    const updateResult = await ProductModel.updateOne(
                        {
                            _id: orderProduct.productId,
                            'variations._id': orderProduct.variationId,
                            'variations.stock': { $gte: qty }
                        },
                        {
                            $inc: {
                                'variations.$.stock': -qty,
                                countInStock: -qty,
                                sale: qty,
                                totalSales: qty
                            }
                        },
                        { session }
                    );

                    if (updateResult.modifiedCount === 0) {
                        throw new Error(`Insufficient stock for ${orderProduct.productTitle || orderProduct.productId}`);
                    }
                } else {
                    const updateResult = await ProductModel.updateOne(
                        {
                            _id: orderProduct.productId,
                            $or: [
                                { 'inventory.endlessStock': true },
                                { countInStock: { $gte: qty } },
                                { 'inventory.stock': { $gte: qty } }
                            ]
                        },
                        {
                            $inc: {
                                countInStock: -qty,
                                sale: qty,
                                totalSales: qty
                            }
                        },
                        { session }
                    );

                    if (updateResult.modifiedCount === 0) {
                        throw new Error(`Insufficient stock for ${orderProduct.productTitle || orderProduct.productId}`);
                    }
                }
            }
        }

        await session.commitTransaction();
        session.endSession();
        session = null;

        // Send email only for non-failed orders
        if (shouldAffectInventory) {
            // Get user email - either from logged-in user or guest customer
            let userEmail = null;
            let userName = null;
            let userInfo = null;
            
            if (request.body.userId) {
                const user = await UserModel.findOne({ _id: request.body.userId });
                if (user?.email) {
                    userEmail = user.email;
                    userName = user.name;
                    userInfo = {
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        phone: user.mobile
                    };
                }
            } else if (request.body.guestCustomer?.email) {
                // Guest checkout
                userEmail = request.body.guestCustomer.email;
                userName = request.body.guestCustomer.name;
                userInfo = {
                    name: request.body.guestCustomer.name,
                    email: request.body.guestCustomer.email,
                    phone: request.body.guestCustomer.phone
                };
            }
            
            // Send customer confirmation email
            if (userEmail) {
                console.log('📧 Preparing to send order confirmation email to:', userEmail);
                const recipients = [userEmail];
                try {
                    const emailResult = await sendEmailFun({
                        sendTo: recipients,
                        subject: "Order Confirmation - Zuba House",
                        text: "",
                        html: OrderConfirmationEmail(userName || 'Customer', order)
                    });
                    console.log('✅ Customer confirmation email sent successfully:', {
                        to: userEmail,
                        result: emailResult
                    });
                } catch (emailError) {
                    console.error('❌ Failed to send customer confirmation email:', {
                        to: userEmail,
                        error: emailError.message,
                        stack: emailError.stack
                    });
                    // Don't fail order creation if email fails
                }
            } else {
                console.warn('⚠️ No user email found - skipping customer confirmation email');
            }

            // Send admin notification email
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'sales@zubahouse.com';
                console.log('📧 Preparing to send admin notification email to:', adminEmail);
                
                // Get shipping address if available - prefer order.shippingAddress, then fetch from delivery_address
                let shippingAddress = null;
                if (order.shippingAddress) {
                    // Use shipping address stored directly in order
                    shippingAddress = order.shippingAddress;
                } else if (order.delivery_address) {
                    try {
                        shippingAddress = await AddressModel.findById(order.delivery_address);
                    } catch (addrError) {
                        console.log('Could not fetch shipping address:', addrError.message);
                    }
                }

                const adminEmailResult = await sendEmailFun({
                    sendTo: [adminEmail],
                    subject: `New Order #${order._id} - ${userName || 'Guest Customer'}`,
                    text: "",
                    html: AdminOrderNotificationEmail(order, userInfo, shippingAddress)
                });
                console.log('✅ Admin notification email sent successfully:', {
                    to: adminEmail,
                    result: adminEmailResult
                });
            } catch (adminEmailError) {
                console.error('❌ Error sending admin notification email:', {
                    error: adminEmailError.message,
                    stack: adminEmailError.stack
                });
                // Don't fail order creation if admin email fails
            }
        }


        console.log('✅ Order created successfully:', {
            orderId: order._id,
            userId: order.userId || 'Guest',
            totalAmount: order.totalAmt,
            paymentStatus: order.payment_status
        });

        return sendSuccess(response, 201, "Order Placed Successfully", { order, orderId: order._id });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('❌ Order creation error:', {
            message: error.message,
            stack: error.stack,
            body: request.body
        });
        
        const clientError =
            error.message?.includes('Insufficient stock') ||
            error.message?.includes('Invalid order item') ||
            error.message?.includes('Product not found') ||
            error.message?.includes('variation not found');

        return sendError(
            response,
            clientError ? 400 : 500,
            error.message || 'Failed to create order',
            process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
        );
    }
}


export async function getOrderDetailsController(request, response) {
    try {
        if (request.userRole !== 'ADMIN') {
            return sendError(response, 403, 'Unauthorized');
        }

        const { page, limit } = request.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

        const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate('delivery_address userId').skip((pageNum - 1) * limitNum).limit(limitNum);

        const total = await OrderModel.countDocuments();

        return sendSuccess(response, 200, "order list", {
            orders: orderlist,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        })
    } catch (error) {
        return sendError(response, 500, error.message || "Failed to fetch order list")
    }
}

export async function getUserOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

        const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId').skip((pageNum - 1) * limitNum).limit(limitNum);

        const total = await OrderModel.countDocuments({ userId: userId });

        return sendSuccess(response, 200, "order list", {
            orders: orderlist,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        })
    } catch (error) {
        return sendError(response, 500, error.message || "Failed to fetch user order list")
    }
}


export async function getOrderByIdController(request, response) {
    try {
        const { id } = request.params;
        if (!id) {
            return sendError(response, 400, 'Order id is required');
        }

        const order = await OrderModel.findById(id).populate('delivery_address userId');
        if (!order) {
            return sendError(response, 404, 'Order not found');
        }

        if (request.userRole === 'ADMIN') {
            return sendSuccess(response, 200, 'Order details', { order });
        }

        const ownerId = order.userId?.toString();
        if (ownerId && ownerId === request.userId?.toString()) {
            return sendSuccess(response, 200, 'Order details', { order });
        }

        return sendError(response, 403, 'Forbidden');
    } catch (error) {
        return sendError(response, 500, error.message || 'Failed to fetch order');
    }
}


export async function getTotalOrdersCountController(request, response) {
    try {
        if (request.userRole !== 'ADMIN') {
            return sendError(response, 403, 'Unauthorized');
        }
        const ordersCount = await OrderModel.countDocuments();
        return sendSuccess(response, 200, "Order count fetched", { count: ordersCount })

    } catch (error) {
        return sendError(response, 500, error.message || "Failed to fetch total order count")
    }
}



// PayPal functions removed - using Stripe for payments
// If you need PayPal support in the future, uncomment and configure these functions



export const updateOrderStatusController = async (request, response) => {
    try {
        const { id } = request.params;
        const { status, trackingNumber, estimatedDelivery, order_status } = request.body;

        console.log('🔧 Order Update Request:', {
            orderId: id,
            status: status,
            order_status: order_status,
            body: request.body
        });

        // Validate status if provided
        const validStatuses = ['Received', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        if (status && !validStatuses.includes(status)) {
            console.log('❌ Invalid status provided:', status);
            return sendError(response, 400, 'Invalid status. Must be one of: ' + validStatuses.join(', '));
        }

        const order = await OrderModel.findById(id);
        if (!order) {
            console.log('❌ Order not found:', id);
            return sendError(response, 404, 'Order not found');
        }

        console.log('✅ Order found:', order._id, 'Current status:', order.status || order.order_status);

        // Build update object
        const updateData = {};
        
        // Update new status system
        if (status) {
            const oldStatus = order.status;
            updateData.status = status;
            
            // Add to status history
            if (!order.statusHistory) {
                order.statusHistory = [];
            }
            order.statusHistory.push({
                status: status,
                timestamp: new Date(),
                updatedBy: request.userId || null
            });
        }
        
        // Update legacy order_status for backward compatibility
        if (order_status) {
            updateData.order_status = order_status;
            
            // If status is not provided but order_status is, map it
            if (!status) {
                const statusMap = {
                    'pending': 'Received',
                    'confirm': 'Processing',
                    'delivered': 'Delivered'
                };
                const mappedStatus = statusMap[order_status] || order_status;
                if (validStatuses.includes(mappedStatus)) {
                    updateData.status = mappedStatus;
                    if (!order.statusHistory) {
                        order.statusHistory = [];
                    }
                    order.statusHistory.push({
                        status: mappedStatus,
                        timestamp: new Date(),
                        updatedBy: request.userId || null
                    });
                }
            }
        }
        
        // Update tracking number if provided
        if (trackingNumber !== undefined) {
            updateData.trackingNumber = trackingNumber;
        }
        
        // Update estimated delivery if provided
        if (estimatedDelivery) {
            updateData.estimatedDelivery = new Date(estimatedDelivery);
        }

        // Store old status for comparison
        const oldStatus = order.status || order.order_status;
        
        // Apply updates
        Object.assign(order, updateData);
        const savedOrder = await order.save();
        
        // Get the new status (prioritize new status field)
        const newStatus = savedOrder.status || savedOrder.order_status;
        
        console.log('✅ Order updated successfully:', {
            orderId: savedOrder._id,
            oldStatus: oldStatus,
            newStatus: newStatus,
            statusProvided: status,
            order_statusProvided: order_status,
            updateData: updateData
        });

        // ========================================
        // CREDIT VENDOR BALANCE WHEN ORDER IS DELIVERED
        // ========================================
        const isDelivered = newStatus === 'Delivered' || newStatus === 'delivered' || order_status === 'delivered';
        const wasNotDelivered = oldStatus !== 'Delivered' && oldStatus !== 'delivered';
        
        if (isDelivered && wasNotDelivered) {
            console.log('💰 Order delivered - crediting vendor balances...');
            try {
                // Get vendor items from order
                const vendorItems = savedOrder.products.filter(p => p.vendor || p.vendorId);
                
                if (vendorItems.length > 0) {
                    // Group earnings by vendor
                    const vendorEarnings = {};
                    
                    for (const item of vendorItems) {
                        const vendorId = (item.vendor || item.vendorId)?.toString();
                        if (vendorId) {
                            if (!vendorEarnings[vendorId]) {
                                vendorEarnings[vendorId] = 0;
                            }
                            // Use vendorEarning if calculated, otherwise use subTotal
                            vendorEarnings[vendorId] += item.vendorEarning || item.subTotal || 0;
                            
                            // Update item status to delivered
                            item.vendorStatus = 'DELIVERED';
                            item.deliveredAt = new Date();
                        }
                    }
                    
                    // Credit each vendor
                    for (const [vendorId, earning] of Object.entries(vendorEarnings)) {
                        if (earning > 0) {
                            try {
                                await creditVendorBalance(vendorId, earning, savedOrder._id);
                                console.log(`✅ Credited $${earning} to vendor ${vendorId}`);
                            } catch (creditErr) {
                                console.error(`❌ Failed to credit vendor ${vendorId}:`, creditErr);
                            }
                        }
                    }
                    
                    // Save order with updated vendor statuses
                    await savedOrder.save();
                }
            } catch (vendorCreditError) {
                console.error('⚠️ Vendor credit error (non-blocking):', vendorCreditError);
                // Don't fail status update if vendor credit fails
            }
        }

        // Send email notification if status changed (check both status and order_status)
        // Always send email if status is provided (even if it's the same, admin might want to notify customer)
        const statusChanged = status || order_status; // Send email if either status field is updated
        
        if (statusChanged) {
            console.log('📧 Status update detected, preparing to send email...');
            console.log('📧 Status change details:', {
                statusProvided: status,
                order_statusProvided: order_status,
                oldStatus: oldStatus,
                newStatus: newStatus,
                willSendEmail: true
            });
            try {
                // Import email service and template
                const { sendEmail } = await import('../config/emailService.js');
                const OrderStatusEmailTemplate = (await import('../utils/orderStatusEmailTemplate.js')).default;
                
                // Get customer email (support both registered users and guest orders)
                let customerEmail = '';
                let customerName = '';
                
                if (savedOrder.guestCustomer?.email) {
                    customerEmail = savedOrder.guestCustomer.email;
                    customerName = savedOrder.guestCustomer.name || 'Customer';
                    console.log('📧 Found guest customer email:', customerEmail);
                } else if (savedOrder.userId) {
                    const UserModel = (await import('../models/user.model.js')).default;
                    const user = await UserModel.findById(savedOrder.userId);
                    if (user) {
                        customerEmail = user.email;
                        customerName = user.name || 'Customer';
                        console.log('📧 Found registered user email:', customerEmail);
                    } else {
                        console.log('⚠️ User not found for userId:', savedOrder.userId);
                    }
                } else {
                    console.log('⚠️ No userId or guestCustomer found in order');
                }
                
                // Only send email if we have a customer email
                if (customerEmail) {
                    console.log('📧 Sending status update email to:', customerEmail);
                    console.log('📧 Order details:', {
                        orderId: savedOrder._id,
                        status: newStatus,
                        hasProducts: savedOrder.products?.length > 0
                    });
                    
                    try {
                        // Populate products for email template
                        const populatedOrder = await savedOrder.populate('products.productId');
                        
                        const emailSubject = `Order Status Update - Order #${savedOrder._id.toString().slice(-8).toUpperCase()}`;
                        const emailText = `Your order #${savedOrder._id.toString().slice(-8).toUpperCase()} status has been updated to ${newStatus}.`;
                        
                        console.log('📧 Calling sendEmail function...');
                        const emailResult = await sendEmail(
                            customerEmail,
                            emailSubject,
                            emailText,
                            OrderStatusEmailTemplate(populatedOrder, newStatus)
                        );
                        
                        if (emailResult && emailResult.success) {
                            console.log('✅ Status update email sent successfully:', emailResult.messageId);
                        } else {
                            console.error('❌ Email sending failed:', emailResult?.error || 'Unknown error');
                            console.error('Email result:', emailResult);
                        }
                    } catch (templateError) {
                        console.error('❌ Error generating email template:', templateError.message);
                        console.error('Template error stack:', templateError.stack);
                    }
                } else {
                    console.log('⚠️ No customer email found. Order details:', {
                        hasGuestCustomer: !!savedOrder.guestCustomer,
                        guestEmail: savedOrder.guestCustomer?.email,
                        hasUserId: !!savedOrder.userId,
                        userId: savedOrder.userId
                    });
                }
            } catch (emailError) {
                // Don't fail the order update if email fails
                console.error('❌ Error sending status update email:', emailError.message);
            }
        }

        // Create notification for customer if status changed
        if (status && order.userId) {
            try {
                const Notification = (await import('../models/notification.model.js')).default;
                await Notification.create({
                    userId: order.userId,
                    type: 'order_status',
                    title: `Order ${newStatus}`,
                    message: `Your order #${order._id} is now ${newStatus}`,
                    orderId: order._id,
                    isRead: false
                });
                
                // Send push notification
                try {
                    const { sendOrderNotification } = await import('./notification.controller.js');
                    const orderNumber = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
                    await sendOrderNotification(
                        order.userId.toString(),
                        order._id.toString(),
                        status.toUpperCase(),
                        orderNumber
                    );
                    console.log('✅ Push notification sent for order status update');
                } catch (pushError) {
                    // Don't fail order update if push notification fails
                    console.error('⚠️ Failed to send push notification:', pushError.message);
                }
            } catch (notifError) {
                // Don't fail if notification model doesn't exist yet
                console.log('Notification not created (model may not exist yet):', notifError.message);
            }
        }

        const responseMessage = status 
            ? `Order status updated to ${status}` 
            : (order_status 
                ? `Order status updated to ${order_status}` 
                : "Order updated");

        console.log('📤 Sending response:', responseMessage);

        return sendSuccess(response, 200, responseMessage, { order: savedOrder })
    } catch (error) {
        return sendError(response, 500, error.message || "Failed to update order status")
    }

}






export const totalSalesController = async (request, response) => {
    try {
        if (request.userRole !== 'ADMIN') {
            return sendError(response, 403, 'Unauthorized');
        }
        const currentYear = new Date().getFullYear();

        const ordersList = await OrderModel.find();

        let totalSales = 0;
        let monthlySales = [
            {
                name: 'JAN',
                TotalSales: 0
            },
            {
                name: 'FEB',
                TotalSales: 0
            },
            {
                name: 'MAR',
                TotalSales: 0
            },
            {
                name: 'APRIL',
                TotalSales: 0
            },
            {
                name: 'MAY',
                TotalSales: 0
            },
            {
                name: 'JUNE',
                TotalSales: 0
            },
            {
                name: 'JULY',
                TotalSales: 0
            },
            {
                name: 'AUG',
                TotalSales: 0
            },
            {
                name: 'SEP',
                TotalSales: 0
            },
            {
                name: 'OCT',
                TotalSales: 0
            },
            {
                name: 'NOV',
                TotalSales: 0
            },
            {
                name: 'DEC',
                TotalSales: 0
            },
        ]


        for (let i = 0; i < ordersList.length; i++) {
            totalSales = totalSales + parseInt(ordersList[i].totalAmt);
            const str = JSON.stringify(ordersList[i]?.createdAt);
            const year = str.substr(1, 4);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            if (currentYear == year) {

                if (month === 1) {
                    monthlySales[0] = {
                        name: 'JAN',
                        TotalSales: monthlySales[0].TotalSales = parseInt(monthlySales[0].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 2) {

                    monthlySales[1] = {
                        name: 'FEB',
                        TotalSales: monthlySales[1].TotalSales = parseInt(monthlySales[1].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 3) {
                    monthlySales[2] = {
                        name: 'MAR',
                        TotalSales: monthlySales[2].TotalSales = parseInt(monthlySales[2].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 4) {
                    monthlySales[3] = {
                        name: 'APRIL',
                        TotalSales: monthlySales[3].TotalSales = parseInt(monthlySales[3].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 5) {
                    monthlySales[4] = {
                        name: 'MAY',
                        TotalSales: monthlySales[4].TotalSales = parseInt(monthlySales[4].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 6) {
                    monthlySales[5] = {
                        name: 'JUNE',
                        TotalSales: monthlySales[5].TotalSales = parseInt(monthlySales[5].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 7) {
                    monthlySales[6] = {
                        name: 'JULY',
                        TotalSales: monthlySales[6].TotalSales = parseInt(monthlySales[6].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 8) {
                    monthlySales[7] = {
                        name: 'AUG',
                        TotalSales: monthlySales[7].TotalSales = parseInt(monthlySales[7].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 9) {
                    monthlySales[8] = {
                        name: 'SEP',
                        TotalSales: monthlySales[8].TotalSales = parseInt(monthlySales[8].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 10) {
                    monthlySales[9] = {
                        name: 'OCT',
                        TotalSales: monthlySales[9].TotalSales = parseInt(monthlySales[9].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 11) {
                    monthlySales[10] = {
                        name: 'NOV',
                        TotalSales: monthlySales[10].TotalSales = parseInt(monthlySales[10].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 12) {
                    monthlySales[11] = {
                        name: 'DEC',
                        TotalSales: monthlySales[11].TotalSales = parseInt(monthlySales[11].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

            }


        }


        return sendSuccess(response, 200, 'Sales summary', {
            totalSales,
            monthlySales,
        })

    } catch (error) {
        return sendError(response, 500, error.message || error)
    }
}





export const totalUsersController = async (request, response) => {
    try {
        if (request.userRole !== 'ADMIN') {
            return sendError(response, 403, 'Unauthorized');
        }
        const users = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);



        let monthlyUsers = [
            {
                name: 'JAN',
                TotalUsers: 0
            },
            {
                name: 'FEB',
                TotalUsers: 0
            },
            {
                name: 'MAR',
                TotalUsers: 0
            },
            {
                name: 'APRIL',
                TotalUsers: 0
            },
            {
                name: 'MAY',
                TotalUsers: 0
            },
            {
                name: 'JUNE',
                TotalUsers: 0
            },
            {
                name: 'JULY',
                TotalUsers: 0
            },
            {
                name: 'AUG',
                TotalUsers: 0
            },
            {
                name: 'SEP',
                TotalUsers: 0
            },
            {
                name: 'OCT',
                TotalUsers: 0
            },
            {
                name: 'NOV',
                TotalUsers: 0
            },
            {
                name: 'DEC',
                TotalUsers: 0
            },
        ]




        for (let i = 0; i < users.length; i++) {

            if (users[i]?._id?.month === 1) {
                monthlyUsers[0] = {
                    name: 'JAN',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 2) {
                monthlyUsers[1] = {
                    name: 'FEB',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 3) {
                monthlyUsers[2] = {
                    name: 'MAR',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 4) {
                monthlyUsers[3] = {
                    name: 'APRIL',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 5) {
                monthlyUsers[4] = {
                    name: 'MAY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 6) {
                monthlyUsers[5] = {
                    name: 'JUNE',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 7) {
                monthlyUsers[6] = {
                    name: 'JULY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 8) {
                monthlyUsers[7] = {
                    name: 'AUG',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 9) {
                monthlyUsers[8] = {
                    name: 'SEP',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 10) {
                monthlyUsers[9] = {
                    name: 'OCT',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 11) {
                monthlyUsers[10] = {
                    name: 'NOV',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 12) {
                monthlyUsers[11] = {
                    name: 'DEC',
                    TotalUsers: users[i].count
                }
            }

        }



        return sendSuccess(response, 200, 'User registration summary', {
            TotalUsers: monthlyUsers,
        })

    } catch (error) {
        return sendError(response, 500, error.message || error)
    }
}



export async function deleteOrder(request, response) {
    try {
        const order = await OrderModel.findById(request.params.id);
        const { cancellationReason } = request.body;

        console.log('Order cancellation request:', request.params.id);

        if (!order) {
            return sendError(response, 404, "Order Not found");
        }

        if (request.userRole !== 'ADMIN') {
            const ownerId = order.userId?.toString();
            const reqUid = request.userId?.toString();
            if (!ownerId || !reqUid || ownerId !== reqUid) {
                return sendError(response, 403, 'Forbidden');
            }
        }

        // Get user email for cancellation notification
        let userEmail = null;
        let userName = null;
        
        if (order.userId) {
            const user = await UserModel.findById(order.userId);
            if (user?.email) {
                userEmail = user.email;
                userName = user.name;
            }
        } else if (order.guestCustomer?.email) {
            userEmail = order.guestCustomer.email;
            userName = order.guestCustomer.name;
        }

        // Restore inventory before deleting
        if (order.products && order.products.length > 0) {
            for (const product of order.products) {
                try {
                    const productDoc = await ProductModel.findById(product.productId);
                    if (productDoc) {
                        await ProductModel.findByIdAndUpdate(
                            product.productId,
                            {
                                $inc: {
                                    countInStock: product.quantity || 1,
                                    sale: -(product.quantity || 1)
                                }
                            },
                            { new: true }
                        );
                    }
                } catch (productError) {
                    console.error('Error restoring inventory for product:', product.productId, productError);
                }
            }
        }

        // Send cancellation email before deleting
        if (userEmail) {
            try {
                await sendEmailFun({
                    sendTo: [userEmail],
                    subject: "Order Cancellation - Zuba House",
                    text: "",
                    html: OrderCancellationEmail(userName || 'Customer', order, cancellationReason || 'Order cancelled by admin')
                });
                console.log('Cancellation email sent to:', userEmail);
            } catch (emailError) {
                console.error('Error sending cancellation email:', emailError);
                // Continue with deletion even if email fails
            }
        }

        const deletedOrder = await OrderModel.findByIdAndDelete(request.params.id);

        if (!deletedOrder) {
            return sendError(response, 404, "Order not deleted!");
        }

        return sendSuccess(response, 200, "Order cancelled and deleted successfully");
    } catch (error) {
        console.error('Error cancelling order:', error);
        return sendError(response, 500, error.message || "Failed to cancel order");
    }
}
