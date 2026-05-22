import express from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import * as giftCardController from '../controllers/giftCard.controller.js';

const router = express.Router();

// Public routes
router.post('/validate', optionalAuth, giftCardController.validateGiftCard);
router.post('/apply', optionalAuth, giftCardController.applyGiftCard);

// User routes
router.get('/my-cards', optionalAuth, giftCardController.getMyGiftCards);

// Admin routes (add admin middleware when available)
// router.post('/', adminAuth, giftCardController.createGiftCard);
// router.get('/all', adminAuth, giftCardController.getAllGiftCards);
// router.put('/:id', adminAuth, giftCardController.updateGiftCard);
// router.post('/:id/add-balance', adminAuth, giftCardController.addBalance);

// For now, allow authenticated users to manage (you should add admin check)
router.post('/', optionalAuth, giftCardController.createGiftCard);
router.get('/all', optionalAuth, giftCardController.getAllGiftCards);
router.put('/:id', optionalAuth, giftCardController.updateGiftCard);
router.post('/:id/add-balance', optionalAuth, giftCardController.addBalance);

export default router;

