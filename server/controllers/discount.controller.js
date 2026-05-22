/**
 * Combined Discount Controller
 * Handles all discount-related operations including:
 * - Applying coupons and gift cards together
 * - Calculating total discounts
 * - Getting discount summary
 */

import * as discountService from '../services/discount.service.js';
import CouponModel from '../models/coupon.model.js';
import GiftCardModel from '../models/giftCard.model.js';

/**
 * Calculate all discounts for cart
 * POST /api/discounts/calculate
 */
export const calculateDiscounts = async (req, res) => {
  try {
    const {
      cartItems = [],
      cartTotal = 0,
      shippingCost = 0,
      couponCode = null,
      giftCardCode = null
    } = req.body;

    const userId = req.userId || null;
    const userEmail = req.user?.email || req.body.email || null;

    const result = await discountService.calculateDiscounts({
      cartItems,
      cartTotal: parseFloat(cartTotal) || 0,
      userId,
      userEmail,
      couponCode,
      giftCardCode,
      shippingCost: parseFloat(shippingCost) || 0
    });

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error,
        discounts: result.discounts
      });
    }

    return res.json({
      success: true,
      discounts: result.discounts
    });

  } catch (error) {
    console.error('Calculate discounts error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate discounts'
    });
  }
};

/**
 * Record discount usage after order completion
 * POST /api/discounts/record-usage
 */
export const recordDiscountUsage = async (req, res) => {
  try {
    const {
      orderId,
      couponCode,
      giftCardCode,
      couponDiscount,
      giftCardDiscount
    } = req.body;

    const userId = req.userId || null;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Record coupon usage
    if (couponCode && couponDiscount > 0) {
      try {
        const coupon = await CouponModel.findOne({ code: couponCode.toUpperCase() });
        if (coupon && userId) {
          await coupon.recordUsage(userId, orderId, couponDiscount);
        }
      } catch (error) {
        console.error('Record coupon usage error:', error);
        // Don't fail the request if coupon recording fails
      }
    }

    // Record gift card usage
    if (giftCardCode && giftCardDiscount > 0) {
      try {
        const giftCard = await GiftCardModel.findOne({ 
          code: giftCardCode.toUpperCase().replace(/-/g, '') 
        });
        if (giftCard) {
          await giftCard.applyBalance(giftCardDiscount, orderId);
        }
      } catch (error) {
        console.error('Record gift card usage error:', error);
        // Don't fail the request if gift card recording fails
      }
    }

    return res.json({
      success: true,
      message: 'Discount usage recorded successfully'
    });

  } catch (error) {
    console.error('Record discount usage error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to record discount usage'
    });
  }
};

/**
 * Remove coupon from cart
 * POST /api/discounts/remove-coupon
 */
export const removeCoupon = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Coupon removed',
      discounts: {
        coupon: null,
        couponDiscount: 0,
        totalDiscount: 0
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove coupon'
    });
  }
};

/**
 * Remove gift card from cart
 * POST /api/discounts/remove-gift-card
 */
export const removeGiftCard = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Gift card removed',
      discounts: {
        giftCard: null,
        giftCardDiscount: 0,
        totalDiscount: 0
      }
    });
  } catch (error) {
    console.error('Remove gift card error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove gift card'
    });
  }
};

