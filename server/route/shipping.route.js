import express from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import * as shippingController from '../controllers/shipping.controller.js';

const router = express.Router();

// Public routes - anyone can get shipping rates
router.post('/rates', optionalAuth, shippingController.getShippingRates);
router.post('/calculate', optionalAuth, shippingController.calculateShippingRates);
router.get('/address-autocomplete', shippingController.addressAutocomplete);
router.get('/address-details', shippingController.addressDetails);
router.post('/parse-phone', shippingController.parsePhone);
router.post('/validate-phone', shippingController.validatePhone);
router.get('/track/:trackingNumber', shippingController.trackShipment);

// Protected routes (require authentication)
router.post('/create-shipment', optionalAuth, shippingController.createShipment);

export default router;

