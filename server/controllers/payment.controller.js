import OrderModel from '../models/order.model.js';
import { markOrderPaid } from '../services/orderPayment.service.js';
import {
  getStripe,
  getStripeCurrency,
  isStripeConfigured,
  mapStripeError,
  stripeCall,
} from '../services/stripeClient.js';

async function assertStripeReady(res) {
  if (!isStripeConfigured()) {
    res.status(500).json({
      error: true,
      success: false,
      message: 'Stripe API key is missing. Set STRIPE_SECRET_KEY on the server (Render).',
      code: 'STRIPE_NOT_CONFIGURED',
    });
    return false;
  }
  try {
    await stripeCall((s, opts) =>
      opts.stripeAccount ? s.balance.retrieve({}, opts) : s.balance.retrieve()
    );
    return true;
  } catch (err) {
    const mapped = mapStripeError(err);
    res.status(mapped.status).json(mapped.body);
    return false;
  }
}

export const createPaymentIntent = async (req, res) => {
  try {
    if (!(await assertStripeReady(res))) return;

    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid amount. Amount must be a positive number.',
      });
    }

    const currency = getStripeCurrency();
    const piParams = {
      amount: Math.round(Number(amount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'zuba_mobile',
      },
    };

    const paymentIntent = await stripeCall((s, opts) =>
      opts.stripeAccount
        ? s.paymentIntents.create(piParams, opts)
        : s.paymentIntents.create(piParams)
    );

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      id: paymentIntent.id,
    });
  } catch (err) {
    console.error('[Stripe] createPaymentIntent:', err?.message || err);
    const mapped = mapStripeError(err);
    return res.status(mapped.status).json(mapped.body);
  }
};

/**
 * POST /api/stripe/create-checkout-session
 * Opens Stripe Hosted Checkout (real card entry on stripe.com).
 */
export const createCheckoutSession = async (req, res) => {
  try {
    if (!(await assertStripeReady(res))) return;

    const { amount, orderId, successUrl, cancelUrl, metadata = {} } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'orderId is required',
      });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid amount',
      });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Order not found',
      });
    }

    const currency = getStripeCurrency();
    const amountCents = Math.round(Number(amount) * 100);

    const resolvedSuccessUrl =
      successUrl ||
      `zuba://payment-success?orderId=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl =
      cancelUrl || `zuba://payment-cancel?orderId=${encodeURIComponent(orderId)}`;

    const session = await stripeCall((s, opts) => {
      const params = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: amountCents,
              product_data: {
                name: `Zuba House Order #${String(orderId).slice(-8).toUpperCase()}`,
                description: 'Secure checkout — Zuba House',
              },
            },
            quantity: 1,
          },
        ],
        client_reference_id: String(orderId),
        metadata: {
          orderId: String(orderId),
          source: metadata.source || 'zuba_mobile_app',
        },
        success_url: resolvedSuccessUrl,
        cancel_url: resolvedCancelUrl,
      };
      return opts.stripeAccount
        ? s.checkout.sessions.create(params, opts)
        : s.checkout.sessions.create(params);
    });

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

    await OrderModel.findByIdAndUpdate(orderId, { paymentId: session.id }).catch(() => undefined);

    console.log('[Stripe] Checkout session:', session.id, 'order:', orderId, 'amount:', amount);

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      paymentIntentId,
    });
  } catch (err) {
    console.error('[Stripe] createCheckoutSession:', err?.message || err);
    const mapped = mapStripeError(err);
    return res.status(mapped.status).json(mapped.body);
  }
};

/**
 * GET /api/stripe/checkout-status/:sessionId
 */
export const getCheckoutStatus = async (req, res) => {
  try {
    if (!(await assertStripeReady(res))) return;

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'sessionId is required',
      });
    }

    const session = await stripeCall((s, opts) =>
      opts.stripeAccount
        ? s.checkout.sessions.retrieve(sessionId, opts)
        : s.checkout.sessions.retrieve(sessionId)
    );

    return res.status(200).json({
      success: true,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: (session.amount_total || 0) / 100,
      currency: (session.currency || getStripeCurrency()).toUpperCase(),
      orderId: session.metadata?.orderId || session.client_reference_id || null,
    });
  } catch (err) {
    console.error('[Stripe] getCheckoutStatus:', err?.message || err);
    const mapped = mapStripeError(err);
    return res.status(mapped.status).json(mapped.body);
  }
};

/**
 * POST /api/stripe/webhook
 * Register in index.js with express.raw() before express.json().
 */
export const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      await markOrderPaid(orderId, session.id, 'stripe');
      console.log('[Stripe Webhook] Order paid:', orderId);
    }
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await markOrderPaid(orderId, pi.id, 'stripe');
      }
    }
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.json({ received: true });
};

// GET /api/stripe/account-info
export const getStripeAccountInfo = async (req, res) => {
  try {
    if (!(await assertStripeReady(res))) return;

    const acct = await stripeCall((s, opts) =>
      opts.stripeAccount ? s.accounts.retrieve({}, opts) : s.accounts.retrieve()
    );

    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    return res.status(200).json({
      success: true,
      account: {
        id: acct.id,
        email: acct.email || null,
        business_type: acct.business_type || null,
        country: acct.country || null,
      },
      keyPrefix: secretKey.substring(0, 7),
      livemode: secretKey.startsWith('sk_live_'),
      configured: true,
    });
  } catch (err) {
    console.error('[Stripe] account-info:', err?.message || err);
    const mapped = mapStripeError(err);
    return res.status(mapped.status).json({ ...mapped.body, configured: false });
  }
};

export const stripeHealth = async (req, res) => {
  try {
    if (!(await assertStripeReady(res))) return;

    const balance = await stripeCall((s, opts) =>
      opts.stripeAccount ? s.balance.retrieve({}, opts) : s.balance.retrieve()
    );
    const currency = getStripeCurrency().toUpperCase();
    const secretKey = process.env.STRIPE_SECRET_KEY || '';

    return res.json({
      ok: true,
      configured: true,
      livemode: secretKey.startsWith('sk_live_'),
      stripeLivemode: balance.livemode,
      currency,
      available: balance.available,
      pending: balance.pending,
    });
  } catch (err) {
    console.error('[Stripe Health]', err?.message || err);
    const mapped = mapStripeError(err);
    return res.status(mapped.status).json({ ok: false, ...mapped.body });
  }
};
