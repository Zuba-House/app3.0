import Coupon from '../models/coupon.model.js';
import { sendError, sendSuccess } from '../utils/response.js';

function normalizePlatform(platform) {
  const p = String(platform || 'web').toLowerCase();
  return p === 'mobile' || p === 'ios' || p === 'android' ? 'mobile' : 'web';
}

function checkPlatformAllowed(coupon, platform) {
  const channels = coupon.allowedChannels?.length ? coupon.allowedChannels : ['web', 'mobile'];
  const normalized = normalizePlatform(platform);
  if (!channels.includes(normalized)) {
    return {
      ok: false,
      message: 'This coupon is not valid for this platform',
      code: 'PLATFORM_MISMATCH',
    };
  }
  return { ok: true };
}

export const validateCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return sendError(res, 400, 'Invalid coupon code');

    const platformCheck = checkPlatformAllowed(coupon, req.body.platform);
    if (!platformCheck.ok) {
      return res.status(400).json({
        success: false,
        error: true,
        message: platformCheck.message,
        code: platformCheck.code,
      });
    }

    return sendSuccess(res, 200, 'Coupon valid', {
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minimumAmount: coupon.minimumAmount,
        freeShipping: coupon.freeShipping,
        allowedChannels: coupon.allowedChannels,
      },
    });
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const cartTotal = Number(req.body.cartTotal || 0);
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return sendError(res, 400, 'Invalid coupon code');

    const platformCheck = checkPlatformAllowed(coupon, req.body.platform);
    if (!platformCheck.ok) {
      return res.status(400).json({
        success: false,
        error: true,
        message: platformCheck.message,
        code: platformCheck.code,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountAmount) / 100;
    } else {
      discount = coupon.discountAmount;
    }
    if (coupon.maximumAmount && discount > coupon.maximumAmount) {
      discount = coupon.maximumAmount;
    }

    return sendSuccess(res, 200, 'Coupon applied', {
      discount,
      type: coupon.discountType,
      freeShipping: coupon.freeShipping,
    });
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};

export const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 200, 'Coupons list', { coupons });
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const payload = { ...req.body, code: String(req.body.code || '').toUpperCase() };
    const coupon = await Coupon.create(payload);
    return sendSuccess(res, 201, 'Coupon created', { coupon });
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return sendError(res, 404, 'Coupon not found');
    return sendSuccess(res, 200, 'Coupon updated', { coupon });
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Coupon deleted');
  } catch (e) {
    return sendError(res, 500, e.message);
  }
};
