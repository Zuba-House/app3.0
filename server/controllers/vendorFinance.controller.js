import VendorModel from '../models/vendor.model.js';
import PayoutModel from '../models/payout.model.js';
import OrderModel from '../models/order.model.js';
import mongoose from 'mongoose';

/**
 * GET /api/vendor/finance/summary
 * Get vendor financial summary including balance, earnings, and recent activity
 */
export const summary = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    if (!vendorId) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Vendor ID not found'
      });
    }

    const vendor = await VendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate pending earnings (from orders that are processing/shipped but not delivered)
    const pendingEarningsResult = await OrderModel.aggregate([
      {
        $match: {
          $or: [
            { 'products.vendor': new mongoose.Types.ObjectId(vendorId) },
            { 'products.vendorId': new mongoose.Types.ObjectId(vendorId) }
          ]
        }
      },
      { $unwind: '$products' },
      {
        $match: {
          $or: [
            { 'products.vendor': new mongoose.Types.ObjectId(vendorId) },
            { 'products.vendorId': new mongoose.Types.ObjectId(vendorId) }
          ],
          'products.vendorStatus': { $in: ['RECEIVED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'] }
        }
      },
      {
        $group: {
          _id: null,
          pendingEarnings: { $sum: { $ifNull: ['$products.vendorEarning', '$products.subTotal'] } },
          pendingOrders: { $sum: 1 }
        }
      }
    ]);

    const pendingData = pendingEarningsResult[0] || { pendingEarnings: 0, pendingOrders: 0 };

    // Get recent delivered orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarningsResult = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          $or: [
            { 'products.vendor': new mongoose.Types.ObjectId(vendorId) },
            { 'products.vendorId': new mongoose.Types.ObjectId(vendorId) }
          ]
        }
      },
      { $unwind: '$products' },
      {
        $match: {
          $or: [
            { 'products.vendor': new mongoose.Types.ObjectId(vendorId) },
            { 'products.vendorId': new mongoose.Types.ObjectId(vendorId) }
          ],
          'products.vendorStatus': 'DELIVERED'
        }
      },
      {
        $group: {
          _id: null,
          recentEarnings: { $sum: { $ifNull: ['$products.vendorEarning', '$products.subTotal'] } },
          recentOrders: { $sum: 1 }
        }
      }
    ]);

    const recentData = recentEarningsResult[0] || { recentEarnings: 0, recentOrders: 0 };

    // Get recent transactions (delivered orders)
    const recentTransactions = await OrderModel.find({
      $or: [
        { 'products.vendor': vendorId },
        { 'products.vendorId': vendorId }
      ],
      'products.vendorStatus': 'DELIVERED'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id orderNumber products createdAt totalAmt')
      .lean();

    // Filter to only include vendor's items in transactions
    const formattedTransactions = recentTransactions.map(order => {
      const vendorItems = order.products.filter(item => {
        const itemVendorId = item.vendor || item.vendorId;
        return itemVendorId && itemVendorId.toString() === String(vendorId);
      });

      const vendorEarning = vendorItems.reduce((sum, item) => {
        return sum + (item.vendorEarning || item.subTotal || 0);
      }, 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
        date: order.createdAt,
        itemsCount: vendorItems.length,
        earning: vendorEarning,
        type: 'ORDER_EARNING'
      };
    });

    // Get recent payout history
    const recentPayouts = await PayoutModel.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedPayouts = recentPayouts.map(payout => ({
      _id: payout._id,
      amount: payout.amount,
      status: payout.status,
      method: payout.paymentMethodSnapshot?.payoutMethod || 'N/A',
      requestedAt: payout.requestedAt,
      processedAt: payout.paidAt || payout.approvedAt || payout.rejectedAt,
      type: 'PAYOUT'
    }));

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        summary: {
          availableBalance: vendor.availableBalance || 0,
          pendingBalance: vendor.pendingBalance || 0,
          totalEarnings: vendor.totalEarnings || 0,
          totalWithdrawn: vendor.withdrawnAmount || 0,
          commissionRate: vendor.commissionValue || 15,
          commissionType: vendor.commissionType || 'PERCENT'
        },
        stats: {
          pendingEarnings: pendingData.pendingEarnings || 0,
          pendingOrdersCount: pendingData.pendingOrders || 0,
          last30DaysEarnings: recentData.recentEarnings || 0,
          last30DaysOrders: recentData.recentOrders || 0
        },
        recentTransactions: formattedTransactions,
        recentPayouts: formattedPayouts,
        canWithdraw: vendor.availableBalance > 0 && 
                     vendor.payoutMethod !== 'NONE' && 
                     vendor.status === 'APPROVED',
        payoutMethodConfigured: vendor.payoutMethod !== 'NONE'
      }
    });
  } catch (error) {
    console.error('vendorFinance.summary error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/payouts
 * List all payouts for the vendor with filtering and pagination
 */
export const listPayouts = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { vendor: vendorId };

    // Apply status filter
    if (status && ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'].includes(status)) {
      filter.status = status;
    }

    // Apply date filters
    if (startDate || endDate) {
      filter.requestedAt = {};
      if (startDate) {
        filter.requestedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.requestedAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payouts, total] = await Promise.all([
      PayoutModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      PayoutModel.countDocuments(filter)
    ]);

    // Calculate totals by status
    const statusTotals = await PayoutModel.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totals = statusTotals.reduce((acc, item) => {
      acc[item._id.toLowerCase()] = { count: item.count, amount: item.total };
      return acc;
    }, {});

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        payouts,
        totals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('vendorFinance.listPayouts error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/vendor/payouts/request
 * Request a new payout/withdrawal
 */
export const requestPayout = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const userId = req.userId;
    const { amount, notes } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid withdrawal amount'
      });
    }

    const vendor = await VendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check vendor status
    if (vendor.status !== 'APPROVED') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Your vendor account must be approved to request withdrawals'
      });
    }

    // Check if payout method is configured
    if (vendor.payoutMethod === 'NONE' || !vendor.payoutMethod) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Please configure your payout method in settings before requesting a withdrawal'
      });
    }

    // Minimum withdrawal amount (configurable)
    const MIN_WITHDRAWAL = 50;
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`
      });
    }

    // Check available balance
    if (amount > vendor.availableBalance) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Insufficient balance',
        availableBalance: vendor.availableBalance
      });
    }

    // Check for existing pending withdrawal
    const pendingPayout = await PayoutModel.findOne({
      vendor: vendorId,
      status: 'REQUESTED'
    });

    if (pendingPayout) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'You already have a pending withdrawal request. Please wait for it to be processed.',
        pendingAmount: pendingPayout.amount
      });
    }

    // Create payout request with payment method snapshot
    const payout = new PayoutModel({
      vendor: vendorId,
      amount,
      requestedBy: userId,
      notes: notes || '',
      status: 'REQUESTED',
      requestedAt: new Date(),
      paymentMethodSnapshot: {
        payoutMethod: vendor.payoutMethod,
        accountName: vendor.payoutDetails?.accountName,
        accountNumber: vendor.payoutDetails?.accountNumber,
        bankName: vendor.payoutDetails?.bankName,
        routingNumber: vendor.payoutDetails?.routingNumber,
        paypalEmail: vendor.payoutDetails?.paypalEmail,
        momoNumber: vendor.payoutDetails?.momoNumber,
        momoProvider: vendor.payoutDetails?.momoProvider
      }
    });

    await payout.save();

    // Update vendor balance - move from available to pending
    vendor.availableBalance -= amount;
    vendor.pendingBalance = (vendor.pendingBalance || 0) + amount;
    await vendor.save();

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Withdrawal request submitted successfully. You will be notified once it is processed.',
      data: {
        payoutId: payout._id,
        amount: payout.amount,
        status: payout.status,
        requestedAt: payout.requestedAt,
        newAvailableBalance: vendor.availableBalance
      }
    });
  } catch (error) {
    console.error('vendorFinance.requestPayout error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/payouts/:id
 * Get details of a specific payout
 */
export const getPayoutDetails = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { id } = req.params;

    const payout = await PayoutModel.findOne({
      _id: id,
      vendor: vendorId
    }).lean();

    if (!payout) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Payout not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('vendorFinance.getPayoutDetails error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/me/payout-settings
 * Update vendor payout method and details
 */
export const updatePayoutSettings = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { payoutMethod, payoutDetails } = req.body;

    // Validate payout method
    const validMethods = ['BANK_TRANSFER', 'PAYPAL', 'MOMO'];
    if (!payoutMethod || !validMethods.includes(payoutMethod)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Invalid payout method. Must be one of: ${validMethods.join(', ')}`
      });
    }

    // Validate required fields based on method
    if (payoutMethod === 'BANK_TRANSFER') {
      if (!payoutDetails?.accountName || !payoutDetails?.accountNumber || !payoutDetails?.bankName) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Bank transfer requires accountName, accountNumber, and bankName'
        });
      }
    } else if (payoutMethod === 'PAYPAL') {
      if (!payoutDetails?.paypalEmail) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'PayPal requires paypalEmail'
        });
      }
    } else if (payoutMethod === 'MOMO') {
      if (!payoutDetails?.momoNumber || !payoutDetails?.momoProvider) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Mobile Money requires momoNumber and momoProvider'
        });
      }
    }

    const vendor = await VendorModel.findByIdAndUpdate(
      vendorId,
      {
        $set: {
          payoutMethod,
          payoutDetails: {
            accountName: payoutDetails?.accountName || '',
            accountNumber: payoutDetails?.accountNumber || '',
            bankName: payoutDetails?.bankName || '',
            routingNumber: payoutDetails?.routingNumber || '',
            paypalEmail: payoutDetails?.paypalEmail || '',
            momoNumber: payoutDetails?.momoNumber || '',
            momoProvider: payoutDetails?.momoProvider || ''
          }
        }
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Payout settings updated successfully',
      data: {
        payoutMethod: vendor.payoutMethod,
        payoutDetails: vendor.payoutDetails
      }
    });
  } catch (error) {
    console.error('vendorFinance.updatePayoutSettings error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};
