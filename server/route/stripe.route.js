import express from "express";
import { createPaymentIntent, stripeHealth, getStripeAccountInfo } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.get("/health", stripeHealth);
router.get("/account-info", getStripeAccountInfo);

export default router;


