import { Router } from "express";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import AddressModel from "../models/address.model.js";

const orderTrackingRouter = Router();

// GET /api/orders/track/:orderId
orderTrackingRouter.get("/track/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;

    // Validate inputs
    if (!orderId || !email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Order ID and email are required"
      });
    }

    // Find order by orderId
    const order = await OrderModel.findById(orderId)
      .populate("delivery_address")
      .populate("userId");

    if (!order) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Order not found. Please check your order ID."
      });
    }

    // Get user email to verify
    const user = await UserModel.findById(order.userId);
    
    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Order not found. Please check your order ID and email address."
      });
    }

    // Use new status field if available, otherwise fall back to order_status
    const currentStatus = order.status || order.order_status;
    
    // Map status to tracking status (support both new and legacy statuses)
    const statusMap = {
      // New status system
      "Received": "pending",
      "Processing": "processing",
      "Shipped": "shipped",
      "Out for Delivery": "out_for_delivery",
      "Delivered": "delivered",
      // Legacy status system
      "confirm": "pending",
      "pending": "pending",
      "processing": "processing",
      "shipped": "shipped",
      "out_for_delivery": "out_for_delivery",
      "delivered": "delivered",
      "cancelled": "cancelled"
    };

    const trackingStatus = statusMap[currentStatus] || "pending";

    // Calculate estimated delivery (5-12 business days from order date)
    const orderDate = new Date(order.createdAt);
    const minDeliveryDays = 5;
    const maxDeliveryDays = 12;

    // Add business days (skip weekends)
    const addBusinessDays = (date, days) => {
      let currentDate = new Date(date);
      let addedDays = 0;

      while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          addedDays++;
        }
      }

      return currentDate;
    };

    const minDeliveryDate = addBusinessDays(orderDate, minDeliveryDays);
    const maxDeliveryDate = addBusinessDays(orderDate, maxDeliveryDays);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };

    // Build tracking history based on order status
    // Use statusHistory if available (more accurate), otherwise build from current status
    const trackingHistory = [];

    // If statusHistory exists, use it for accurate tracking
    if (order.statusHistory && order.statusHistory.length > 0) {
      // Add order placed event
      trackingHistory.push({
        status: "Order Placed",
        description: "Your order has been confirmed and is being prepared",
        date: formatDate(orderDate),
        time: orderDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        location: "Zuba House"
      });

      // Add status history events
      order.statusHistory.forEach((historyItem) => {
        const statusDate = new Date(historyItem.timestamp);
        const statusDescriptions = {
          "Received": "We have received your order and it is being processed",
          "Processing": "Your order is being processed and packed",
          "Shipped": "Your package has been handed to the carrier",
          "Out for Delivery": "Your package is on the way to your address",
          "Delivered": "Your package has been delivered successfully"
        };

        trackingHistory.push({
          status: historyItem.status,
          description: statusDescriptions[historyItem.status] || "Status update",
          date: formatDate(statusDate),
          time: statusDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          location: historyItem.status === "Delivered" 
            ? (order.delivery_address?.address?.addressLine1 || order.delivery_address?.address_line1 || "Delivery Address")
            : (historyItem.status === "Shipped" || historyItem.status === "Out for Delivery"
              ? (order.delivery_address?.address?.city || order.delivery_address?.city || "Shipping Facility")
              : "Zuba House")
        });
      });
    } else {
      // Fallback: Build tracking history from current status
      trackingHistory.push({
        status: "Order Placed",
        description: "Your order has been confirmed and is being prepared",
        date: formatDate(orderDate),
        time: orderDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        location: "Zuba House"
      });

      if (["processing", "shipped", "out_for_delivery", "delivered"].includes(trackingStatus)) {
        const processingDate = new Date(orderDate);
        processingDate.setHours(processingDate.getHours() + 6);

        trackingHistory.push({
          status: "Processing",
          description: "Your order is being processed and packed",
          date: formatDate(processingDate),
          time: processingDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          location: "Warehouse - Gatineau, Canada"
        });
      }

      if (["shipped", "out_for_delivery", "delivered"].includes(trackingStatus)) {
        const shippedDate = addBusinessDays(orderDate, 2);

        trackingHistory.push({
          status: "Shipped",
          description: "Your package has been handed to the carrier",
          date: formatDate(shippedDate),
          time: shippedDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          location: "Shipping Facility"
        });
      }

      if (["out_for_delivery", "delivered"].includes(trackingStatus)) {
        const outForDeliveryDate = addBusinessDays(orderDate, minDeliveryDays - 1);

        trackingHistory.push({
          status: "Out for Delivery",
          description: "Your package is on the way to your address",
          date: formatDate(outForDeliveryDate),
          time: "08:30 AM",
          location: order.delivery_address?.address?.city || order.delivery_address?.city || "Your City"
        });
      }

      if (trackingStatus === "delivered") {
        const deliveredDate = order.updatedAt || addBusinessDays(orderDate, minDeliveryDays);

        trackingHistory.push({
          status: "Delivered",
          description: "Your package has been delivered successfully",
          date: formatDate(deliveredDate),
          time: deliveredDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          location: order.delivery_address?.address?.addressLine1 || order.delivery_address?.address_line1 || "Delivery Address"
        });
      }
    }

    // Get address details
    const address = order.delivery_address || {};

    // Prepare response data
    const responseData = {
      error: false,
      success: true,
      orderId: order._id,
      status: trackingStatus,
      currentStatus: currentStatus, // Include the actual status value
      orderDate: formatDate(orderDate),
      estimatedDelivery:
        trackingStatus === "delivered"
          ? formatDate(order.updatedAt || orderDate)
          : `${formatDate(minDeliveryDate)} - ${formatDate(maxDeliveryDate)}`,
      deliveryDays:
        trackingStatus === "delivered"
          ? "Delivered"
          : `${minDeliveryDays}-${maxDeliveryDays} business days`,
      trackingNumber: order.trackingNumber || `ZH${order._id.toString().slice(-8).toUpperCase()}`,
      shippingMethod: order.shippingMethod || "Standard International Shipping",
      shippingAddress: {
        name: address?.contactInfo?.firstName 
          ? `${address.contactInfo.firstName} ${address.contactInfo.lastName || ''}`.trim()
          : (user?.name || "Customer"),
        street: address?.address?.addressLine1 || address?.address_line1 || "",
        city: address?.address?.city || address?.city || "",
        state: address?.address?.province || address?.state || "",
        zipCode: address?.address?.postalCode || address?.pincode || "",
        country: address?.address?.country || address?.country || ""
      },
      items: order.products.map((item) => ({
        name: item.productTitle || "Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || ""
      })),
      totalAmount: order.totalAmt || 0,
      paymentMethod: order.payment_status === "PAID" ? "Card" : order.payment_status || "Card",
      trackingHistory: trackingHistory.reverse() // Most recent first
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: "An error occurred while tracking your order. Please try again later."
    });
  }
});

export default orderTrackingRouter;

