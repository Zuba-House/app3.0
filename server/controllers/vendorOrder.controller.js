import OrderModel from '../models/order.model.js';

/**
 * GET /api/vendor/orders
 * List vendor's orders (only items belonging to vendor)
 */
export const list = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Match by either vendor or vendorId for backward compatibility
    const match = {
      $or: [
        { 'products.vendor': vendorId },
        { 'products.vendorId': vendorId }
      ]
    };
    if (status) {
      match['products.vendorStatus'] = status;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email')
        .populate('products.vendor', 'storeName storeSlug')
        .lean(),
      OrderModel.countDocuments(match)
    ]);

    // Map to vendor-specific summary
    const mapped = orders.map((order) => {
      const vendorItems = order.products.filter(
        (item) => {
          const itemVendorId = item.vendor || item.vendorId;
          return itemVendorId && itemVendorId.toString() === String(vendorId);
        }
      );

      const totalAmount = vendorItems.reduce(
        (sum, item) => sum + (item.vendorEarning || item.subTotal || 0),
        0
      );

      // Get vendor status (use first item's status or most common)
      const vendorStatus = vendorItems.length > 0 ? vendorItems[0].vendorStatus : 'RECEIVED';

      return {
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString(),
        createdAt: order.createdAt,
        status: order.order_status || order.status, // Global order status
        payment_status: order.payment_status,
        vendorStatus, // Vendor-specific status
        vendorItems,
        vendorTotal: totalAmount,
        customerName: order.customerName || (order.userId?.name) || order.guestCustomer?.name || 'Guest',
        shippingAddress: order.shippingAddress
      };
    });

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        items: mapped,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('vendorOrder.list error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/orders/:id
 * Get order detail (vendor-scoped - only vendor's items)
 */
export const detail = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const orderId = req.params.id;

    const order = await OrderModel.findById(orderId)
      .populate('userId', 'name email')
      .populate('products.productId')
      .populate('products.vendor', 'storeName storeSlug')
      .lean();

    if (!order) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Order not found'
      });
    }

    // Filter to only vendor's items
    const vendorItems = order.products.filter(
      (item) => {
        const itemVendorId = item.vendor || item.vendorId;
        return itemVendorId && itemVendorId.toString() === String(vendorId);
      }
    );

    if (vendorItems.length === 0) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'No items found for this vendor in this order'
      });
    }

    const vendorTotal = vendorItems.reduce(
      (sum, item) => sum + (item.vendorEarning || item.subTotal || 0),
      0
    );

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString(),
        createdAt: order.createdAt,
        status: order.order_status || order.status,
        payment_status: order.payment_status,
        shippingAddress: order.shippingAddress,
        phone: order.phone,
        customerName: order.customerName || (order.userId?.name) || order.guestCustomer?.name || 'Guest',
        deliveryNote: order.deliveryNote,
        items: vendorItems,
        vendorTotal,
        // Get vendor summary if exists
        vendorSummary: order.vendorSummary?.find(
          (summary) => {
            const summaryVendorId = summary.vendor || summary.vendorId;
            return summaryVendorId && summaryVendorId.toString() === String(vendorId);
          }
        )
      }
    });
  } catch (error) {
    console.error('vendorOrder.detail error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/orders/:id/status
 * Update vendor order status (for vendor's items only)
 */
export const updateStatus = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const orderId = req.params.id;
    const { status, trackingNumber } = req.body;

    const allowedStatuses = [
      'RECEIVED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Order not found'
      });
    }

    // Update only vendor's items
    let updated = false;
    order.products.forEach((item) => {
      const itemVendorId = item.vendor || item.vendorId;
      if (itemVendorId && itemVendorId.toString() === String(vendorId)) {
        item.vendorStatus = status;
        
        if (status === 'SHIPPED') {
          item.shippedAt = new Date();
        }
        
        if (status === 'DELIVERED') {
          item.deliveredAt = new Date();
        }

        if (trackingNumber) {
          item.trackingNumber = trackingNumber;
        }

        updated = true;
      }
    });

    if (!updated) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'No items found for this vendor in this order'
      });
    }

    await order.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Vendor order status updated successfully',
      data: {
        orderId: order._id,
        status,
        trackingNumber: trackingNumber || null
      }
    });
  } catch (error) {
    console.error('vendorOrder.updateStatus error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

