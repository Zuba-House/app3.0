import PayoutModel from '../models/payout.model.js';
import VendorModel from '../models/vendor.model.js';
import mongoose from 'mongoose';
import { sendVendorWithdrawalApproved, sendVendorWithdrawalRejected, sendVendorWithdrawalPaid } from '../utils/vendorEmails.js';

/**
 * GET /api/admin/vendors/payouts/all
 * Get all payout requests with filtering and pagination
 */
export const getAllPayouts = async (req, res) => {
  try {
    const { status, vendorId, startDate, endDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};

    // Apply status filter
    if (status && ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'].includes(status)) {
      filter.status = status;
    }

    // Apply vendor filter
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      filter.vendor = new mongoose.Types.ObjectId(vendorId);
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
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [payouts, total] = await Promise.all([
      PayoutModel.find(filter)
        .populate('vendor', 'storeName storeSlug email phone')
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      PayoutModel.countDocuments(filter)
    ]);

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        payouts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('adminPayout.getAllPayouts error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/admin/vendors/payouts/stats
 * Get payout statistics
 */
export const getPayoutStats = async (req, res) => {
  try {
    const stats = await PayoutModel.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
              }
            }
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalPayouts: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' }
              }
            }
          ],
          thisMonth: [
            {
              $match: {
                requestedAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: '$amount' }
              }
            }
          ],
          pendingUrgent: [
            {
              $match: {
                status: 'REQUESTED',
                requestedAt: {
                  $lte: new Date(Date.now() - 48 * 60 * 60 * 1000) // Older than 48 hours
                }
              }
            },
            {
              $count: 'count'
            }
          ]
        }
      }
    ]);

    const result = stats[0];

    const formattedStats = {
      byStatus: result.byStatus.reduce((acc, item) => {
        acc[item._id.toLowerCase()] = {
          count: item.count,
          totalAmount: parseFloat(item.totalAmount.toFixed(2))
        };
        return acc;
      }, {}),
      totals: {
        totalPayouts: result.totals[0]?.totalPayouts || 0,
        totalAmount: parseFloat((result.totals[0]?.totalAmount || 0).toFixed(2)),
        avgAmount: parseFloat((result.totals[0]?.avgAmount || 0).toFixed(2))
      },
      thisMonth: {
        count: result.thisMonth[0]?.count || 0,
        amount: parseFloat((result.thisMonth[0]?.amount || 0).toFixed(2))
      },
      pendingCount: result.byStatus.find(s => s._id === 'REQUESTED')?.count || 0,
      pendingAmount: parseFloat((result.byStatus.find(s => s._id === 'REQUESTED')?.totalAmount || 0).toFixed(2)),
      urgentPending: result.pendingUrgent[0]?.count || 0
    };

    return res.status(200).json({
      error: false,
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('adminPayout.getPayoutStats error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/admin/vendors/payouts/:id
 * Get single payout details
 */
export const getPayoutById = async (req, res) => {
  try {
    const { payoutId: id } = req.params;

    const payout = await PayoutModel.findById(id)
      .populate('vendor', 'storeName storeSlug email phone payoutMethod payoutDetails availableBalance')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .lean();

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
    console.error('adminPayout.getPayoutById error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/admin/vendors/payouts/:id/approve
 * Approve a payout request
 */
export const approvePayout = async (req, res) => {
  try {
    const { payoutId: id } = req.params;
    const adminId = req.userId;
    const { notes } = req.body;

    const payout = await PayoutModel.findById(id);

    if (!payout) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'REQUESTED') {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Cannot approve payout with status: ${payout.status}`
      });
    }

    // Update payout status
    payout.status = 'APPROVED';
    payout.approvedBy = adminId;
    payout.approvedAt = new Date();
    if (notes) {
      payout.notes = (payout.notes ? payout.notes + '\n' : '') + `Admin: ${notes}`;
    }
    await payout.save();

    // Get vendor for email notification
    const vendor = await VendorModel.findById(payout.vendor);

    // Send email notification (non-blocking)
    if (vendor?.email) {
      sendVendorWithdrawalApproved(vendor, payout).catch(err => {
        console.error('Failed to send withdrawal approved email:', err);
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Payout approved successfully',
      data: payout
    });
  } catch (error) {
    console.error('adminPayout.approvePayout error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/admin/vendors/payouts/:id/reject
 * Reject a payout request and refund to vendor balance
 */
export const rejectPayout = async (req, res) => {
  try {
    const { payoutId: id } = req.params;
    const adminId = req.userId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const payout = await PayoutModel.findById(id);

    if (!payout) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'REQUESTED') {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Cannot reject payout with status: ${payout.status}`
      });
    }

    // Update payout status
    payout.status = 'REJECTED';
    payout.rejectedBy = adminId;
    payout.rejectedAt = new Date();
    payout.rejectionReason = reason;
    await payout.save();

    // Refund amount to vendor's available balance
    const vendor = await VendorModel.findById(payout.vendor);
    if (vendor) {
      vendor.pendingBalance = Math.max(0, (vendor.pendingBalance || 0) - payout.amount);
      vendor.availableBalance = (vendor.availableBalance || 0) + payout.amount;
      await vendor.save();

      // Send email notification (non-blocking)
      if (vendor.email) {
        sendVendorWithdrawalRejected(vendor, payout).catch(err => {
          console.error('Failed to send withdrawal rejected email:', err);
        });
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Payout rejected and amount refunded to vendor balance',
      data: {
        payout,
        refundedAmount: payout.amount,
        vendorNewBalance: vendor?.availableBalance
      }
    });
  } catch (error) {
    console.error('adminPayout.rejectPayout error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/admin/vendors/payouts/:id/mark-paid
 * Mark an approved payout as paid (after manual bank transfer)
 */
export const markPayoutAsPaid = async (req, res) => {
  try {
    const { payoutId: id } = req.params;
    const adminId = req.userId;
    const { transactionRef, notes } = req.body;

    const payout = await PayoutModel.findById(id);

    if (!payout) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'APPROVED') {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Cannot mark as paid: payout status is ${payout.status}. Must be APPROVED first.`
      });
    }

    // Update payout status
    payout.status = 'PAID';
    payout.paidAt = new Date();
    if (transactionRef) {
      payout.transactionRef = transactionRef;
    }
    if (notes) {
      payout.notes = (payout.notes ? payout.notes + '\n' : '') + `Payment: ${notes}`;
    }
    await payout.save();

    // Update vendor - move from pending to withdrawn
    const vendor = await VendorModel.findById(payout.vendor);
    if (vendor) {
      vendor.pendingBalance = Math.max(0, (vendor.pendingBalance || 0) - payout.amount);
      vendor.withdrawnAmount = (vendor.withdrawnAmount || 0) + payout.amount;
      await vendor.save();

      // Send email notification (non-blocking)
      if (vendor.email) {
        sendVendorWithdrawalPaid(vendor, payout).catch(err => {
          console.error('Failed to send withdrawal paid email:', err);
        });
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Payout marked as paid successfully',
      data: {
        payout,
        vendorTotalWithdrawn: vendor?.withdrawnAmount
      }
    });
  } catch (error) {
    console.error('adminPayout.markPayoutAsPaid error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

