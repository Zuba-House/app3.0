import express from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import * as couponController from '../controllers/coupon.controller.js';

const router = express.Router();

// Public routes
router.post('/validate', optionalAuth, couponController.validateCoupon);
router.post('/apply', optionalAuth, couponController.applyCoupon);
router.get('/', couponController.getActiveCoupons);

// Admin routes (add admin middleware when available)
// router.post('/', adminAuth, couponController.createCoupon);
// router.get('/all', adminAuth, couponController.getAllCoupons);
// router.put('/:id', adminAuth, couponController.updateCoupon);
// router.delete('/:id', adminAuth, couponController.deleteCoupon);

// For now, allow authenticated users to manage (you should add admin check)
router.post('/', optionalAuth, couponController.createCoupon);
router.get('/all', optionalAuth, couponController.getAllCoupons);
router.put('/:id', optionalAuth, couponController.updateCoupon);
router.delete('/:id', optionalAuth, couponController.deleteCoupon);

export default router;

