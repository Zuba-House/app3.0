import CouponModel from '../models/coupon.model.js';
import mongoose from 'mongoose';

/**
 * GET /api/vendor/coupons
 * List all coupons for the vendor with filtering and pagination
 */
export const list = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = { 
      vendor: vendorId,
      scope: 'VENDOR' // Only vendor-specific coupons
    };

    // Apply status filter
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [coupons, total] = await Promise.all([
      CouponModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CouponModel.countDocuments(filter)
    ]);

    // Add computed fields
    const enhancedCoupons = coupons.map(coupon => ({
      ...coupon,
      isExpired: coupon.endDate && new Date(coupon.endDate) < new Date(),
      usageRemaining: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null,
      isValid: coupon.isActive && 
               (!coupon.startDate || new Date(coupon.startDate) <= new Date()) &&
               (!coupon.endDate || new Date(coupon.endDate) >= new Date()) &&
               (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit)
    }));

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        coupons: enhancedCoupons,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('vendorCoupon.list error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/vendor/coupons
 * Create a new vendor coupon
 */
export const create = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const {
      code,
      description,
      discountType,
      discountAmount,
      minimumAmount,
      maximumAmount,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
      productIds,
      excludedProductIds,
      categoryIds,
      excludedCategoryIds,
      individualUse,
      excludeSaleItems,
      freeShipping
    } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Coupon code is required'
      });
    }

    if (!discountType || !['percentage', 'fixed_cart', 'fixed_product'].includes(discountType)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid discount type. Must be: percentage, fixed_cart, or fixed_product'
      });
    }

    if (discountAmount === undefined || discountAmount < 0) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Discount amount is required and must be positive'
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountAmount > 100) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Check if code already exists for this vendor
    const existingCoupon = await CouponModel.findOne({
      code: code.toUpperCase().trim(),
      vendor: vendorId
    });

    if (existingCoupon) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'A coupon with this code already exists'
      });
    }

    // Create coupon
    const coupon = new CouponModel({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountAmount,
      minimumAmount: minimumAmount || 0,
      maximumAmount: maximumAmount || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit || null,
      usageLimitPerUser: usageLimitPerUser || 1,
      usageCount: 0,
      productIds: productIds || [],
      excludedProductIds: excludedProductIds || [],
      categoryIds: categoryIds || [],
      excludedCategoryIds: excludedCategoryIds || [],
      individualUse: individualUse || false,
      excludeSaleItems: excludeSaleItems || false,
      freeShipping: freeShipping || false,
      isActive: true,
      vendor: vendorId,
      scope: 'VENDOR'
    });

    await coupon.save();

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('vendorCoupon.create error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'A coupon with this code already exists'
      });
    }
    
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/coupons/:id
 * Get a single coupon by ID
 */
export const get = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { id } = req.params;

    const coupon = await CouponModel.findOne({
      _id: id,
      vendor: vendorId
    })
      .populate('productIds', 'name images')
      .populate('categoryIds', 'name slug')
      .lean();

    if (!coupon) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Coupon not found'
      });
    }

    // Add computed fields
    const enhancedCoupon = {
      ...coupon,
      isExpired: coupon.endDate && new Date(coupon.endDate) < new Date(),
      usageRemaining: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null,
      isValid: coupon.isActive && 
               (!coupon.startDate || new Date(coupon.startDate) <= new Date()) &&
               (!coupon.endDate || new Date(coupon.endDate) >= new Date()) &&
               (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit)
    };

    return res.status(200).json({
      error: false,
      success: true,
      data: enhancedCoupon
    });
  } catch (error) {
    console.error('vendorCoupon.get error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/coupons/:id
 * Update a coupon
 */
export const update = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { id } = req.params;
    const updates = req.body;

    // Find the coupon first
    const coupon = await CouponModel.findOne({
      _id: id,
      vendor: vendorId
    });

    if (!coupon) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Coupon not found'
      });
    }

    // Don't allow changing code if coupon has been used
    if (updates.code && coupon.usageCount > 0 && updates.code.toUpperCase() !== coupon.code) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Cannot change code of a coupon that has been used'
      });
    }

    // Check if new code conflicts with existing
    if (updates.code && updates.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await CouponModel.findOne({
        code: updates.code.toUpperCase().trim(),
        vendor: vendorId,
        _id: { $ne: id }
      });

      if (existingCoupon) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'A coupon with this code already exists'
        });
      }
    }

    // Validate discount type if provided
    if (updates.discountType && !['percentage', 'fixed_cart', 'fixed_product'].includes(updates.discountType)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid discount type'
      });
    }

    // Validate percentage discount
    if (updates.discountType === 'percentage' && updates.discountAmount > 100) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Allowed update fields
    const allowedFields = [
      'code', 'description', 'discountType', 'discountAmount',
      'minimumAmount', 'maximumAmount', 'startDate', 'endDate',
      'usageLimit', 'usageLimitPerUser', 'productIds', 'excludedProductIds',
      'categoryIds', 'excludedCategoryIds', 'individualUse',
      'excludeSaleItems', 'freeShipping', 'isActive'
    ];

    // Apply updates
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'code') {
          coupon[field] = updates[field].toUpperCase().trim();
        } else if (field === 'startDate' || field === 'endDate') {
          coupon[field] = updates[field] ? new Date(updates[field]) : null;
        } else {
          coupon[field] = updates[field];
        }
      }
    });

    await coupon.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('vendorCoupon.update error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * DELETE /api/vendor/coupons/:id
 * Soft delete a coupon (set isActive to false)
 */
export const remove = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { id } = req.params;

    const coupon = await CouponModel.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Coupon not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('vendorCoupon.remove error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/coupons/:id/toggle
 * Toggle coupon active status
 */
export const toggleStatus = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { id } = req.params;

    const coupon = await CouponModel.findOne({
      _id: id,
      vendor: vendorId
    });

    if (!coupon) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: coupon._id,
        code: coupon.code,
        isActive: coupon.isActive
      }
    });
  } catch (error) {
    console.error('vendorCoupon.toggleStatus error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/coupons/stats
 * Get coupon statistics for the vendor
 */
export const getStats = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    const stats = await CouponModel.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), scope: 'VENDOR' } },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: '$isActive',
                count: { $sum: 1 }
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$discountType',
                count: { $sum: 1 }
              }
            }
          ],
          usage: [
            {
              $group: {
                _id: null,
                totalCoupons: { $sum: 1 },
                totalUsage: { $sum: '$usageCount' },
                averageUsage: { $avg: '$usageCount' }
              }
            }
          ],
          expired: [
            {
              $match: {
                endDate: { $lt: new Date() }
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
      active: result.byStatus.find(s => s._id === true)?.count || 0,
      inactive: result.byStatus.find(s => s._id === false)?.count || 0,
      expired: result.expired[0]?.count || 0,
      byType: result.byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalCoupons: result.usage[0]?.totalCoupons || 0,
      totalUsage: result.usage[0]?.totalUsage || 0,
      averageUsage: Math.round((result.usage[0]?.averageUsage || 0) * 100) / 100
    };

    return res.status(200).json({
      error: false,
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('vendorCoupon.getStats error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};
