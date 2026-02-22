import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.model.js';
import UserModel from '../models/user.model.js';
import AddressModel from "../models/address.model.js";
import VendorModel from '../models/vendor.model.js';
// PayPal removed - using Stripe for payments
// import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import OrderCancellationEmail from "../utils/orderCancellationEmailTemplate.js";
import AdminOrderNotificationEmail from "../utils/adminOrderNotificationEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import { calculateOrderCommissions, creditVendorBalance } from "../utils/commissionCalculator.js";
import { sendVendorNewOrder } from "../utils/vendorEmails.js";

export const createOrderController = async (request, response) => {
    try {
        console.log('📦 Order creation request received:', {
            hasUserId: !!request.body.userId,
            isGuestOrder: !!request.body.guestCustomer,
            productsCount: request.body.products?.length || 0,
            paymentId: request.body.paymentId || 'N/A',
            payment_status: request.body.payment_status || 'N/A'
        });

        // Validate required fields
        if (!request.body.products || !Array.isArray(request.body.products) || request.body.products.length === 0) {
            console.error('❌ Order creation failed: No products provided');
            return response.status(400).json({
                error: true,
                success: false,
                message: 'Products are required to create an order'
            });
        }

        // Handle guest checkout
        const isGuestOrder = request.body.isGuestOrder || (!request.body.userId && request.body.guestCustomer);
        
        // Validate guest customer data if it's a guest order
        if (isGuestOrder && !request.body.guestCustomer) {
            console.error('❌ Order creation failed: Guest order requires guestCustomer data');
            return response.status(400).json({
                error: true,
                success: false,
                message: 'Guest customer information is required'
            });
        }
        
        // Calculate total amount including shipping
        const shippingCost = request.body.shippingCost || 0;
        const productsTotal = request.body.products?.reduce((sum, item) => {
            return sum + (parseFloat(item.price || item.subTotal || 0) * (item.quantity || 1));
        }, 0) || 0;
        const calculatedTotal = productsTotal + shippingCost;
        // Use provided totalAmt if it exists and is valid, otherwise calculate it
        const finalTotal = (request.body.totalAmt && request.body.totalAmt > 0) 
            ? request.body.totalAmt 
            : calculatedTotal;
        
        console.log('💰 Order creation - Amount calculation:', {
            productsTotal,
            shippingCost,
            providedTotalAmt: request.body.totalAmt,
            calculatedTotal,
            finalTotal
        });

        // Update address with phone number if provided
        if (request.body.phone && request.body.delivery_address) {
            try {
                const address = await AddressModel.findById(request.body.delivery_address);
                if (address) {
                    // Update phone in address contactInfo
                    if (!address.contactInfo) {
                        address.contactInfo = {};
                    }
                    address.contactInfo.phone = request.body.phone;
                    await address.save();
                    console.log('✅ Phone number updated in address:', request.body.delivery_address);
                }
            } catch (addressError) {
                console.warn('⚠️ Could not update phone in address:', addressError.message);
                // Continue with order creation even if address update fails
            }
        }

        // Prepare shipping address for order
        let orderShippingAddress = null;
        if (request.body.shippingAddress) {
            const addr = request.body.shippingAddress;
            orderShippingAddress = {
                addressLine1: addr.addressLine1 || addr.address?.addressLine1 || '',
                addressLine2: addr.addressLine2 || addr.address?.addressLine2 || '',
                city: addr.city || addr.address?.city || '',
                province: addr.province || addr.address?.province || '',
                provinceCode: addr.provinceCode || addr.province || addr.address?.provinceCode || '',
                postalCode: addr.postalCode || addr.postal_code || addr.address?.postalCode || '',
                postal_code: addr.postal_code || addr.postalCode || addr.address?.postalCode || '',
                country: addr.country || addr.address?.country || '',
                countryCode: addr.countryCode || addr.address?.countryCode || '',
                coordinates: addr.coordinates || addr.googlePlaces?.coordinates || null
            };
        }

        let order = new OrderModel({
            userId: request.body.userId || null,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: finalTotal, // Ensure shipping is included
            shippingCost: shippingCost,
            shippingRate: request.body.shippingRate || null,
            shippingAddress: orderShippingAddress,
            phone: request.body.phone || '',
            // New customer info fields for better delivery
            customerName: request.body.customerName || '',
            apartmentNumber: request.body.apartmentNumber || '',
            deliveryNote: request.body.deliveryNote || '',
            date: request.body.date,
            // Guest checkout fields
            isGuestOrder: isGuestOrder,
            guestCustomer: request.body.guestCustomer || null,
            // Discount information
            discounts: request.body.discounts || null,
            // Status tracking
            status: 'Received',
            statusHistory: [{
                status: 'Received',
                timestamp: new Date(),
                updatedBy: request.userId || null
            }]
        });

        // Save order to database
        try {
            order = await order.save();
            console.log('✅ Order saved successfully:', order._id);
        } catch (saveError) {
            console.error('❌ Failed to save order:', saveError);
            return response.status(500).json({
                error: true,
                success: false,
                message: 'Failed to save order to database',
                details: process.env.NODE_ENV === 'development' ? saveError.message : undefined
            });
        }

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

        // Update inventory only for successful or COD orders
        const paymentStatus = (request.body.payment_status || '').toUpperCase();
        const shouldAffectInventory = paymentStatus !== 'FAILED';
        
        if (shouldAffectInventory) {
            for (let i = 0; i < request.body.products.length; i++) {
                const orderProduct = request.body.products[i];
                
                // Get product from database
                const product = await ProductModel.findById(orderProduct.productId);
                
                if (!product) {
                    console.error(`Product not found: ${orderProduct.productId}`);
                    continue;
                }
                
                // ========================================
                // HANDLE VARIABLE PRODUCTS
                // ========================================
                if (orderProduct.productType === 'variable' && orderProduct.variationId) {
                    // Find the specific variation
                    const variationIndex = product.variations?.findIndex(
                        v => v._id && v._id.toString() === orderProduct.variationId
                    );
                    
                    if (variationIndex !== -1 && product.variations) {
                        // Update variation stock
                        const currentVariationStock = product.variations[variationIndex].stock || 0;
                        const newVariationStock = Math.max(0, currentVariationStock - orderProduct.quantity);
                        
                        product.variations[variationIndex].stock = newVariationStock;
                        
                        // Update variation stock status
                        if (newVariationStock <= 0) {
                            product.variations[variationIndex].stockStatus = 'out_of_stock';
                        }
                        
                        // Also update total product stock (sum of all variations)
                        const totalStock = product.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
                        product.countInStock = totalStock;
                        
                        // Update product stock status
                        if (totalStock <= 0) {
                            product.stockStatus = 'out_of_stock';
                        }
                        
                        console.log(`Updated variation stock: Product ${orderProduct.productId}, Variation ${orderProduct.variationId}, New stock: ${newVariationStock}`);
                    } else {
                        console.error(`Variation not found: ${orderProduct.variationId}`);
                    }
                }
                // ========================================
                // HANDLE SIMPLE PRODUCTS
                // ========================================
                else {
                    // Update product stock directly
                    const currentStock = product.countInStock || 0;
                    const newStock = Math.max(0, currentStock - orderProduct.quantity);
                    
                    product.countInStock = newStock;
                    
                    // Update stock status
                    if (newStock <= 0) {
                        product.stockStatus = 'out_of_stock';
                    }
                    
                    console.log(`Updated product stock: Product ${orderProduct.productId}, New stock: ${newStock}`);
                }
                
                // ========================================
                // UPDATE SALES COUNT
                // ========================================
                product.sale = (product.sale || 0) + orderProduct.quantity;
                product.totalSales = (product.totalSales || 0) + orderProduct.quantity;
                
                // Save product with updated stock
                await product.save();
            }
        }

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

        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed Successfully",
            order: order,
            orderId: order._id
        });

    } catch (error) {
        console.error('❌ Order creation error:', {
            message: error.message,
            stack: error.stack,
            body: request.body
        });
        
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || 'Failed to create order',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}


export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const total = await OrderModel.countDocuments(orderlist);

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getUserOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const orderTotal = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId');

        const total = await orderTotal?.length;

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getTotalOrdersCountController(request, response) {
    try {
        const ordersCount = await OrderModel.countDocuments();
        return response.status(200).json({
            error: false,
            success: true,
            count: ordersCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
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
            return response.status(400).json({
                success: false,
                error: true,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const order = await OrderModel.findById(id);
        if (!order) {
            console.log('❌ Order not found:', id);
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Order not found'
            });
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

        return response.json({
            message: responseMessage,
            success: true,
            error: false,
            data: savedOrder,
            order: savedOrder // Also include for compatibility
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}






export const totalSalesController = async (request, response) => {
    try {
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


        return response.status(200).json({
            totalSales: totalSales,
            monthlySales: monthlySales,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}





export const totalUsersController = async (request, response) => {
    try {
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



        return response.status(200).json({
            TotalUsers: monthlyUsers,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteOrder(request, response) {
    try {
        const order = await OrderModel.findById(request.params.id);
        const { cancellationReason } = request.body;

        console.log('Order cancellation request:', request.params.id);

        if (!order) {
            return response.status(404).json({
                message: "Order Not found",
                error: true,
                success: false
            });
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
            return response.status(404).json({
                message: "Order not deleted!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            success: true,
            error: false,
            message: "Order cancelled and deleted successfully",
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return response.status(500).json({
            message: error.message || "Failed to cancel order",
            error: true,
            success: false
        });
    }
}
