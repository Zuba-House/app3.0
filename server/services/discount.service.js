/**
 * Discount Service
 * Handles all discount calculations including:
 * - Promo codes / Coupons
 * - Gift cards
 * - Automatic discounts (cart thresholds, first-time buyer, etc.)
 * - Discount stacking rules
 */

import CouponModel from '../models/coupon.model.js';
import GiftCardModel from '../models/giftCard.model.js';
import OrderModel from '../models/order.model.js';
import UserModel from '../models/user.model.js';

/**
 * Calculate all applicable discounts for a cart
 */
export const calculateDiscounts = async ({
  cartItems = [],
  cartTotal = 0,
  userId = null,
  userEmail = null,
  couponCode = null,
  giftCardCode = null,
  shippingCost = 0
}) => {
  const discounts = {
    coupon: null,
    couponDiscount: 0,
    giftCard: null,
    giftCardDiscount: 0,
    automaticDiscounts: [],
    totalDiscount: 0,
    freeShipping: false,
    finalTotal: cartTotal + shippingCost
  };

  try {
    // 1. Apply coupon/promo code
    if (couponCode) {
      const couponResult = await applyCoupon({
        code: couponCode,
        cartItems,
        cartTotal,
        userId,
        userEmail
      });
      
      if (couponResult.success) {
        discounts.coupon = couponResult.coupon;
        discounts.couponDiscount = couponResult.discount;
        discounts.freeShipping = couponResult.freeShipping || false;
      }
    }

    // 2. Apply gift card
    if (giftCardCode) {
      const giftCardResult = await applyGiftCard({
        code: giftCardCode,
        cartTotal: cartTotal - discounts.couponDiscount,
        userId,
        userEmail
      });
      
      if (giftCardResult.success) {
        discounts.giftCard = giftCardResult.giftCard;
        discounts.giftCardDiscount = giftCardResult.discount;
      }
    }

    // 3. Calculate automatic discounts
    const automaticDiscounts = await calculateAutomaticDiscounts({
      cartItems,
      cartTotal,
      userId,
      userEmail
    });
    discounts.automaticDiscounts = automaticDiscounts;

    // Calculate total discount
    const automaticDiscountTotal = automaticDiscounts.reduce(
      (sum, d) => sum + d.discount, 0
    );
    
    discounts.totalDiscount = 
      discounts.couponDiscount + 
      discounts.giftCardDiscount + 
      automaticDiscountTotal;

    // Calculate final total
    let finalTotal = cartTotal - discounts.totalDiscount;
    
    // Apply free shipping if applicable
    if (discounts.freeShipping) {
      discounts.finalTotal = finalTotal; // Shipping already included, but we'll set it to 0
    } else {
      discounts.finalTotal = finalTotal + shippingCost;
    }

    // Ensure final total is not negative
    discounts.finalTotal = Math.max(0, discounts.finalTotal);

    return {
      success: true,
      discounts
    };

  } catch (error) {
    console.error('Discount calculation error:', error);
    return {
      success: false,
      error: error.message,
      discounts
    };
  }
};

/**
 * Apply coupon/promo code
 */
export const applyCoupon = async ({
  code,
  cartItems = [],
  cartTotal = 0,
  userId = null,
  userEmail = null
}) => {
  try {
    const coupon = await CouponModel.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (!coupon) {
      return {
        success: false,
        error: 'Invalid coupon code'
      };
    }

    // Check if coupon is valid
    if (!coupon.isValid) {
      return {
        success: false,
        error: 'This coupon has expired or reached its usage limit'
      };
    }

    // Check user eligibility
    if (userId && !coupon.canUseByUser(userId)) {
      return {
        success: false,
        error: 'You have already used this coupon the maximum number of times'
      };
    }

    // Check email restrictions
    if (userEmail) {
      const emailLower = userEmail.toLowerCase().trim();
      
      if (coupon.excludedEmails.length > 0 && 
          coupon.excludedEmails.includes(emailLower)) {
        return {
          success: false,
          error: 'This coupon is not available for your email address'
        };
      }
      
      if (coupon.allowedEmails.length > 0 && 
          !coupon.allowedEmails.includes(emailLower)) {
        return {
          success: false,
          error: 'This coupon is not available for your email address'
        };
      }
    }

    // Check minimum amount
    if (cartTotal < coupon.minimumAmount) {
      return {
        success: false,
        error: `Minimum purchase amount of $${coupon.minimumAmount} required for this coupon`
      };
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal, cartItems);

    if (discount <= 0) {
      return {
        success: false,
        error: 'This coupon does not apply to items in your cart'
      };
    }

    return {
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount
      },
      discount,
      freeShipping: coupon.freeShipping
    };

  } catch (error) {
    console.error('Apply coupon error:', error);
    return {
      success: false,
      error: error.message || 'Failed to apply coupon'
    };
  }
};

/**
 * Apply gift card
 */
export const applyGiftCard = async ({
  code,
  cartTotal = 0,
  userId = null,
  userEmail = null
}) => {
  try {
    const giftCard = await GiftCardModel.findOne({ 
      code: code.toUpperCase().trim().replace(/-/g, ''),
      isActive: true
    });

    if (!giftCard) {
      return {
        success: false,
        error: 'Invalid gift card code'
      };
    }

    // Check if gift card is valid
    if (!giftCard.isValid) {
      return {
        success: false,
        error: 'This gift card has expired or has no remaining balance'
      };
    }

    // Check user eligibility
    if (!giftCard.canUse(userId, userEmail)) {
      return {
        success: false,
        error: 'This gift card is not available for your account'
      };
    }

    // Calculate discount (use available balance, up to cart total)
    const discount = Math.min(giftCard.currentBalance, cartTotal);

    if (discount <= 0) {
      return {
        success: false,
        error: 'Gift card has no remaining balance'
      };
    }

    return {
      success: true,
      giftCard: {
        id: giftCard._id,
        code: giftCard.code,
        currentBalance: giftCard.currentBalance,
        initialBalance: giftCard.initialBalance
      },
      discount
    };

  } catch (error) {
    console.error('Apply gift card error:', error);
    return {
      success: false,
      error: error.message || 'Failed to apply gift card'
    };
  }
};

/**
 * Calculate automatic discounts
 * Examples: Cart value thresholds, first-time buyer, bulk discounts
 */
export const calculateAutomaticDiscounts = async ({
  cartItems = [],
  cartTotal = 0,
  userId = null,
  userEmail = null
}) => {
  const automaticDiscounts = [];

  try {
    // 1. Cart value threshold discounts
    if (cartTotal >= 200) {
      automaticDiscounts.push({
        type: 'cart_threshold',
        name: 'Spend $200+ Discount',
        description: 'You saved 5% on orders over $200!',
        discount: Math.round((cartTotal * 0.05) * 100) / 100,
        threshold: 200
      });
    } else if (cartTotal >= 100) {
      automaticDiscounts.push({
        type: 'cart_threshold',
        name: 'Spend $100+ Discount',
        description: 'You saved 3% on orders over $100!',
        discount: Math.round((cartTotal * 0.03) * 100) / 100,
        threshold: 100
      });
    }

    // 2. First-time buyer discount
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        const orderCount = await OrderModel.countDocuments({ 
          userId: userId,
          payment_status: 'paid'
        });
        
        if (orderCount === 0) {
          automaticDiscounts.push({
            type: 'first_time_buyer',
            name: 'First Order Discount',
            description: 'Welcome! Enjoy 10% off your first order',
            discount: Math.round((cartTotal * 0.10) * 100) / 100
          });
        }
      }
    }

    // 3. Bulk quantity discount (10+ items)
    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (totalQuantity >= 10) {
      automaticDiscounts.push({
        type: 'bulk_quantity',
        name: 'Bulk Purchase Discount',
        description: 'You saved 5% on orders with 10+ items!',
        discount: Math.round((cartTotal * 0.05) * 100) / 100,
        quantity: totalQuantity
      });
    }

  } catch (error) {
    console.error('Calculate automatic discounts error:', error);
  }

  return automaticDiscounts;
};

/**
 * Validate coupon code (without applying)
 */
export const validateCoupon = async (code, userId = null, userEmail = null) => {
  try {
    const coupon = await CouponModel.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (!coupon) {
      return {
        valid: false,
        error: 'Invalid coupon code'
      };
    }

    if (!coupon.isValid) {
      return {
        valid: false,
        error: 'This coupon has expired or reached its usage limit'
      };
    }

    if (userId && !coupon.canUseByUser(userId)) {
      return {
        valid: false,
        error: 'You have already used this coupon the maximum number of times'
      };
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minimumAmount: coupon.minimumAmount,
        freeShipping: coupon.freeShipping
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Failed to validate coupon'
    };
  }
};

/**
 * Validate gift card code (without applying)
 */
export const validateGiftCard = async (code, userId = null, userEmail = null) => {
  try {
    const giftCard = await GiftCardModel.findOne({ 
      code: code.toUpperCase().trim().replace(/-/g, ''),
      isActive: true
    });

    if (!giftCard) {
      return {
        valid: false,
        error: 'Invalid gift card code'
      };
    }

    if (!giftCard.isValid) {
      return {
        valid: false,
        error: 'This gift card has expired or has no remaining balance'
      };
    }

    if (!giftCard.canUse(userId, userEmail)) {
      return {
        valid: false,
        error: 'This gift card is not available for your account'
      };
    }

    return {
      valid: true,
      giftCard: {
        code: giftCard.code,
        currentBalance: giftCard.currentBalance,
        initialBalance: giftCard.initialBalance,
        expiryDate: giftCard.expiryDate
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Failed to validate gift card'
    };
  }
};

