import express from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import * as discountController from '../controllers/discount.controller.js';

const router = express.Router();

// Public routes
router.post('/calculate', optionalAuth, discountController.calculateDiscounts);
router.post('/record-usage', optionalAuth, discountController.recordDiscountUsage);
router.post('/remove-coupon', optionalAuth, discountController.removeCoupon);
router.post('/remove-gift-card', optionalAuth, discountController.removeGiftCard);

export default router;

