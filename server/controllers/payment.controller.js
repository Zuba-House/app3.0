import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

// Initialize Stripe with validation
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    try {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        console.log('[Stripe] Initialized with key:', process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...');
    } catch (error) {
        console.error('[Stripe] Failed to initialize:', error.message);
        stripe = null;
    }
} else {
    console.warn('[Stripe] STRIPE_SECRET_KEY not set in environment variables');
}

// Helper: detect if an Org API key is being used
const isOrgKey = (key) => typeof key === 'string' && key.startsWith('sk_org_');

export const createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.error('[Stripe] Cannot create payment intent: Stripe not initialized');
      return res.status(500).json({ 
        error: 'Payment processing unavailable',
        message: 'Stripe API key is missing or invalid. Please contact support.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    // Validate Stripe key is still valid
    try {
      await stripe.balance.retrieve();
    } catch (keyError) {
      console.error('[Stripe] API key validation failed:', keyError.message);
      return res.status(500).json({
        error: 'Payment processing unavailable',
        message: 'Stripe API key is invalid or expired. Please contact support to update payment configuration.',
        code: 'STRIPE_KEY_INVALID',
        detail: keyError.message
      });
    }

    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount. Amount must be a positive number." });
    }

    const currency = (process.env.CURRENCY || process.env.STRIPE_CURRENCY || 'USD').toLowerCase();
    const piParams = {
      amount: Math.round(Number(amount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    };

    const options = {};
    if (isOrgKey(process.env.STRIPE_SECRET_KEY)) {
      const targetAccount = process.env.STRIPE_TARGET_ACCOUNT || process.env.STRIPE_ACCOUNT;
      if (targetAccount) {
        options.stripeAccount = targetAccount; // sets Stripe-Account header
      } else {
        return res.status(500).json({ error: 'Organization API key detected. Please set STRIPE_TARGET_ACCOUNT (acct_...) or use a standard account secret key.' });
      }
    }

    // Logging context
    try {
      console.log("[Stripe] Creating PI:", piParams.amount / 100, currency.toUpperCase(), "| testMode:", !(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_"));
    } catch {}

    // Create PaymentIntent
    const paymentIntent = options.stripeAccount
      ? await stripe.paymentIntents.create(piParams, { stripeAccount: options.stripeAccount })
      : await stripe.paymentIntents.create(piParams);

    console.log("[Stripe] PaymentIntent created:", paymentIntent.id, "status:", paymentIntent.status);
    return res.status(200).json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error("[Stripe] Error creating payment intent:", {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      statusCode: err?.statusCode,
      raw: err?.raw
    });
    
    // Handle specific Stripe errors
    let errorMessage = 'Payment processing failed';
    let statusCode = 500;
    
    if (err?.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe API key is invalid or expired. Please contact support.';
      statusCode = 500;
    } else if (err?.type === 'StripeAPIError') {
      errorMessage = 'Stripe API error. Please try again or contact support.';
      statusCode = 502;
    } else if (err?.type === 'StripeConnectionError') {
      errorMessage = 'Unable to connect to Stripe. Please try again.';
      statusCode = 503;
    }
    
    return res.status(statusCode).json({
      error: errorMessage,
      detail: err?.message || String(err),
      code: err?.code || 'STRIPE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/stripe/account-info
export const getStripeAccountInfo = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY is not set or invalid'
      });
    }
    
    // retrieve account info associated with the secret key
    const acct = await stripe.accounts.retrieve();
    // mask sensitive values
    const maskedAccount = {
      id: acct.id,
      email: acct.email || null,
      business_type: acct.business_type || null,
      country: acct.country || null,
    };

    // also return key prefix so frontend can compare
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const keyPrefix = secretKey.substring(0, 7);

    res.status(200).json({ account: maskedAccount, keyPrefix, configured: true });
  } catch (err) {
    console.error('Error retrieving Stripe account info:', err && err.message ? err.message : err);
    
    // Check if it's an authentication error (invalid key)
    if (err?.type === 'StripeAuthenticationError') {
      return res.status(500).json({ 
        error: 'Stripe API key is invalid or expired',
        message: 'Please update STRIPE_SECRET_KEY in environment variables',
        configured: false
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to retrieve Stripe account info', 
      detail: err && err.message ? err.message : String(err),
      configured: false
    });
  }
};

// Optional health endpoint to help diagnose key/account context
export const stripeHealth = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        ok: false, 
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY is not set in environment variables',
        configured: false
      });
    }
    
    const balance = await stripe.balance.retrieve();
    const currency = (process.env.CURRENCY || process.env.STRIPE_CURRENCY || 'USD').toUpperCase();
    res.json({ 
      ok: true, 
      configured: true,
      livemode: balance.livemode, 
      currency, 
      available: balance.available, 
      pending: balance.pending 
    });
  } catch (e) {
    console.error('[Stripe Health] Error:', e?.message || String(e));
    
    // Check if it's an authentication error
    if (e?.type === 'StripeAuthenticationError') {
      return res.status(500).json({ 
        ok: false, 
        configured: true,
        error: 'Stripe API key is invalid or expired',
        message: 'Please update STRIPE_SECRET_KEY in environment variables',
        detail: e?.message
      });
    }
    
    res.status(500).json({ 
      ok: false, 
      configured: stripe !== null,
      error: e?.message || String(e) 
    });
  }
};

/**
 * Create Stripe Checkout Session for mobile/web payments
 * POST /api/stripe/create-checkout-session
 * Supports: Credit/Debit cards, Apple Pay, Google Pay (automatic)
 */
export const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Payment processing unavailable',
        message: 'Stripe is not configured'
      });
    }

    const { amount, orderId, successUrl, cancelUrl, metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const currency = (process.env.CURRENCY || process.env.STRIPE_CURRENCY || 'USD').toLowerCase();
    const baseUrl = process.env.API_URL || process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Order ${orderId ? '#' + orderId.slice(-8).toUpperCase() : ''}`,
              description: 'Zuba House Order',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: cancelUrl || `${baseUrl}/payment-cancel?orderId=${orderId}`,
      metadata: {
        orderId: orderId || '',
        source: metadata.source || 'web',
        ...metadata
      },
      // Enable additional payment methods
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session' // Allow saving card for future payments
        }
      },
      // Phone number collection for shipping
      phone_number_collection: {
        enabled: false
      },
      // Customer info
      ...(req.userId && { client_reference_id: req.userId }),
    });

    console.log('[Stripe] Checkout session created:', session.id);

    return res.status(200).json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
        paymentIntentId: session.payment_intent
      }
    });

  } catch (err) {
    console.error('[Stripe] Error creating checkout session:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      detail: err?.message
    });
  }
};

/**
 * Get Checkout Session Status
 * GET /api/stripe/checkout-status/:sessionId
 */
export const getCheckoutStatus = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not configured'
      });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      success: true,
      data: {
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase(),
        customerEmail: session.customer_email,
        metadata: session.metadata
      }
    });

  } catch (err) {
    console.error('[Stripe] Error getting checkout status:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to get checkout status',
      detail: err?.message
    });
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Stripe Webhook] No webhook secret configured');
    return res.status(400).json({ error: 'Webhook not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err?.message);
    return res.status(400).json({ error: `Webhook Error: ${err?.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('[Stripe Webhook] Payment successful for session:', session.id);
      
      // Update order status if orderId is in metadata
      if (session.metadata?.orderId) {
        try {
          const { default: OrderModel } = await import('../models/order.model.js');
          await OrderModel.findByIdAndUpdate(session.metadata.orderId, {
            payment_status: 'PAID',
            paymentId: session.payment_intent,
            $push: {
              statusHistory: {
                status: 'Payment Received',
                timestamp: new Date(),
                note: `Stripe payment ${session.payment_intent}`
              }
            }
          });
          console.log('[Stripe Webhook] Order updated:', session.metadata.orderId);
        } catch (orderErr) {
          console.error('[Stripe Webhook] Failed to update order:', orderErr);
        }
      }
      break;

    case 'checkout.session.expired':
      console.log('[Stripe Webhook] Session expired:', event.data.object.id);
      break;

    case 'payment_intent.succeeded':
      console.log('[Stripe Webhook] Payment intent succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('[Stripe Webhook] Payment failed:', event.data.object.id);
      break;

    default:
      console.log('[Stripe Webhook] Unhandled event type:', event.type);
  }

  res.json({ received: true });
};
