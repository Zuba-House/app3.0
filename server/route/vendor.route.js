import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { requireVendor } from '../middlewares/vendorAuth.js';

// Controllers
import * as vendorController from '../controllers/vendor.controller.js';
import * as vendorProductController from '../controllers/vendorProduct.controller.js';
import * as vendorOrderController from '../controllers/vendorOrder.controller.js';
import * as vendorFinanceController from '../controllers/vendorFinance.controller.js';
import * as vendorCouponController from '../controllers/vendorCoupon.controller.js';

const router = Router();

// ========== PUBLIC ROUTES (No auth required) ==========
// Step 1: Send OTP to email (works for new and existing users)
router.post('/send-otp', vendorController.sendOTP);

// Step 2: Verify OTP
router.post('/verify-otp', vendorController.verifyOTP);

// Step 3: Complete registration (requires verified email)
router.post('/apply', vendorController.applyToBecomeVendor);

// Vendor Login (dedicated endpoint)
router.post('/login', vendorController.vendorLogin);

// Password Reset
router.post('/forgot-password', vendorController.forgotPassword);
router.post('/reset-password', vendorController.resetPassword);

// Legacy endpoints (kept for backward compatibility)
router.post('/verify-email', vendorController.verifyVendorEmail);
router.post('/resend-otp', vendorController.resendVendorOTP);

// Check application status
router.get('/application-status/:email', vendorController.getApplicationStatus);

// ========== PROTECTED ROUTES (Require auth + vendor role) ==========
// All routes below this middleware will require authentication and vendor role
router.use(auth, requireVendor);

// Profile & Dashboard
router.get('/me', vendorController.getMyProfile);
router.put('/me', vendorController.updateMyProfile);
router.get('/dashboard', vendorController.getDashboardStats);

// Products
router.get('/products', vendorProductController.list);
router.post('/products', vendorProductController.create);
router.get('/products/:id', vendorProductController.get);
router.put('/products/:id', vendorProductController.update);
router.delete('/products/:id', vendorProductController.remove);

// Orders
router.get('/orders', vendorOrderController.list);
router.get('/orders/:id', vendorOrderController.detail);
router.put('/orders/:id/status', vendorOrderController.updateStatus);

// Coupons
router.get('/coupons', vendorCouponController.list);
router.post('/coupons', vendorCouponController.create);
router.get('/coupons/stats', vendorCouponController.getStats); // Must be before :id route
router.get('/coupons/:id', vendorCouponController.get);
router.put('/coupons/:id', vendorCouponController.update);
router.put('/coupons/:id/toggle', vendorCouponController.toggleStatus);
router.delete('/coupons/:id', vendorCouponController.remove);

// Finance / Payouts
router.get('/finance/summary', vendorFinanceController.summary);
router.get('/payouts', vendorFinanceController.listPayouts);
router.post('/payouts/request', vendorFinanceController.requestPayout);
router.get('/payouts/:id', vendorFinanceController.getPayoutDetails);
router.put('/me/payout-settings', vendorFinanceController.updatePayoutSettings);

export default router;

