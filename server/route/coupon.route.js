import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import {
  validateCoupon,
  applyCoupon,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';

const router = Router();

router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);
router.get('/all', auth, adminOnly, listCoupons);
router.post('/', auth, adminOnly, createCoupon);
router.put('/:id', auth, adminOnly, updateCoupon);
router.delete('/:id', auth, adminOnly, deleteCoupon);

export default router;
