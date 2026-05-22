import { Router } from 'express';
import auth from '../middlewares/auth.js';
import * as adminVendorController from '../controllers/adminVendor.controller.js';
import * as adminPayoutController from '../controllers/adminPayout.controller.js';

const router = Router();

// All routes require authentication
router.use(auth);

// Check if user is admin
const requireAdmin = (req, res, next) => {
  // Normalize role comparison (case-insensitive)
  const userRole = (req.userRole || '').toUpperCase();
  
  console.log('🔐 Admin check:', {
    userId: req.userId,
    userRole: req.userRole,
    normalizedRole: userRole,
    isAdmin: userRole === 'ADMIN'
  });
  
  if (userRole !== 'ADMIN') {
    console.log('❌ Admin access denied for role:', req.userRole);
    return res.status(403).json({
      error: true,
      success: false,
      message: 'Admin access only',
      debug: {
        userRole: req.userRole,
        required: 'ADMIN'
      }
    });
  }
  next();
};

router.use(requireAdmin);

// ========================================
// SPECIFIC ROUTES MUST COME BEFORE /:id
// ========================================

// Vendor product management routes (approval/rejection)
router.get('/products', adminVendorController.getVendorProducts);
router.get('/products/:productId', adminVendorController.getVendorProductById);
router.put('/products/:productId/approve', adminVendorController.approveVendorProduct);
router.put('/products/:productId/reject', adminVendorController.rejectVendorProduct);

// Payout management routes
router.get('/payouts/all', adminPayoutController.getAllPayouts);
router.get('/payouts/stats', adminPayoutController.getPayoutStats);
router.get('/payouts/:payoutId', adminPayoutController.getPayoutById);
router.post('/payouts/:payoutId/approve', adminPayoutController.approvePayout);
router.post('/payouts/:payoutId/reject', adminPayoutController.rejectPayout);
router.post('/payouts/:payoutId/mark-paid', adminPayoutController.markPayoutAsPaid);

// ========================================
// PARAMETERIZED VENDOR ROUTES (LAST)
// ========================================

// Vendor management routes
router.get('/', adminVendorController.getAllVendors);
router.get('/:id', adminVendorController.getVendorById);
router.put('/:id', adminVendorController.updateVendor);
router.put('/:id/status', adminVendorController.updateVendorStatus);
router.put('/:id/withdrawal-access', adminVendorController.updateWithdrawalAccess);
router.delete('/:id', adminVendorController.deleteVendor); // Deletes vendor, keeps user
router.delete('/:id/permanent', adminVendorController.deleteVendorPermanent); // Deletes vendor AND user

export default router;

