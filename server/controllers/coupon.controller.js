import CouponModel from '../models/coupon.model.js';
import * as discountService from '../services/discount.service.js';

/**
 * Validate coupon code
 * POST /api/coupons/validate
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId || null;
    const userEmail = req.user?.email || req.body.email || null;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    const result = await discountService.validateCoupon(code, userId, userEmail);

    if (!result.valid) {
      return res.status(200).json({
        success: false,
        valid: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      valid: true,
      coupon: result.coupon
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate coupon'
    });
  }
};

/**
 * Apply coupon to cart
 * POST /api/coupons/apply
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartItems, cartTotal } = req.body;
    const userId = req.userId || null;
    const userEmail = req.user?.email || req.body.email || null;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        error: 'Cart items are required'
      });
    }

    const cartTotalValue = parseFloat(cartTotal) || 0;

    const result = await discountService.applyCoupon({
      code,
      cartItems,
      cartTotal: cartTotalValue,
      userId,
      userEmail
    });

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      coupon: result.coupon,
      discount: result.discount,
      freeShipping: result.freeShipping
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply coupon'
    });
  }
};

/**
 * Get all active coupons (public)
 * GET /api/coupons
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await CouponModel.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
    .select('code description discountType discountAmount minimumAmount freeShipping startDate endDate')
    .limit(50)
    .sort({ createdAt: -1 });

    return res.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Get active coupons error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get coupons'
    });
  }
};

/**
 * Create coupon (Admin only)
 * POST /api/coupons
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
      minimumAmount,
      maximumAmount,
      productIds,
      excludedProductIds,
      categoryIds,
      excludedCategoryIds,
      allowedEmails,
      excludedEmails,
      individualUse,
      excludeSaleItems,
      freeShipping,
      isActive
    } = req.body;

    // Validate required fields
    if (!code || !discountType || discountAmount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Code, discount type, and discount amount are required'
      });
    }

    // Check if code already exists
    const existingCoupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }

    const coupon = new CouponModel({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountAmount: parseFloat(discountAmount),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit || null,
      usageLimitPerUser: usageLimitPerUser || 1,
      minimumAmount: minimumAmount || 0,
      maximumAmount: maximumAmount || null,
      productIds: productIds || [],
      excludedProductIds: excludedProductIds || [],
      categoryIds: categoryIds || [],
      excludedCategoryIds: excludedCategoryIds || [],
      allowedEmails: allowedEmails || [],
      excludedEmails: excludedEmails || [],
      individualUse: individualUse || false,
      excludeSaleItems: excludeSaleItems || false,
      freeShipping: freeShipping || false,
      isActive: isActive !== undefined ? isActive : true
    });

    await coupon.save();

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create coupon'
    });
  }
};

/**
 * Get all coupons (Admin only)
 * GET /api/coupons/all
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await CouponModel.find()
      .sort({ createdAt: -1 })
      .populate('productIds', 'name')
      .populate('categoryIds', 'name');

    return res.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Get all coupons error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get coupons'
    });
  }
};

/**
 * Update coupon (Admin only)
 * PUT /api/coupons/:id
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating code
    if (updateData.code) {
      delete updateData.code;
    }

    const coupon = await CouponModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    return res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update coupon'
    });
  }
};

/**
 * Delete coupon (Admin only)
 * DELETE /api/coupons/:id
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await CouponModel.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    return res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete coupon'
    });
  }
};

