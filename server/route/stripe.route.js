import express from "express";
import { 
  createPaymentIntent, 
  stripeHealth, 
  getStripeAccountInfo,
  createCheckoutSession,
  getCheckoutStatus,
  stripeWebhook
} from "../controllers/payment.controller.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

// Payment Intent (for embedded payment form)
router.post("/create-payment-intent", optionalAuth, createPaymentIntent);

// Checkout Session (for redirect-based checkout - mobile/web)
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);
router.get("/checkout-status/:sessionId", getCheckoutStatus);

// Webhook (raw body required for signature verification)
router.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// Health & Account Info
router.get("/health", stripeHealth);
router.get("/account-info", getStripeAccountInfo);

export default router;


