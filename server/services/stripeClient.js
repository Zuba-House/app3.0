import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log(
      '[Stripe] Initialized:',
      process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...',
      (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? '(LIVE)' : '(TEST)'
    );
  } catch (error) {
    console.error('[Stripe] Failed to initialize:', error.message);
    stripe = null;
  }
} else {
  console.warn('[Stripe] STRIPE_SECRET_KEY not set — card payments disabled');
}

const isOrgKey = (key) => typeof key === 'string' && key.startsWith('sk_org_');

export function getStripe() {
  return stripe;
}

export function isStripeConfigured() {
  return stripe !== null;
}

export function getStripeCurrency() {
  return (process.env.CURRENCY || process.env.STRIPE_CURRENCY || 'USD').toLowerCase();
}

/** Stripe-Account header options for Connect / org keys */
export function getStripeRequestOptions() {
  if (!isOrgKey(process.env.STRIPE_SECRET_KEY)) {
    return {};
  }
  const targetAccount = process.env.STRIPE_TARGET_ACCOUNT || process.env.STRIPE_ACCOUNT;
  if (!targetAccount) {
    return { missingConnectAccount: true };
  }
  return { stripeAccount: targetAccount };
}

export async function stripeCall(fn) {
  if (!stripe) {
    const err = new Error('Stripe is not configured');
    err.code = 'STRIPE_NOT_CONFIGURED';
    throw err;
  }
  const options = getStripeRequestOptions();
  if (options.missingConnectAccount) {
    const err = new Error(
      'Organization API key requires STRIPE_TARGET_ACCOUNT (acct_...) or use a standard secret key'
    );
    err.code = 'STRIPE_CONNECT_ACCOUNT_REQUIRED';
    throw err;
  }
  const { stripeAccount } = options;
  if (stripeAccount) {
    return fn(stripe, { stripeAccount });
  }
  return fn(stripe, {});
}

export function mapStripeError(err) {
  if (err?.code === 'STRIPE_NOT_CONFIGURED' || err?.code === 'STRIPE_CONNECT_ACCOUNT_REQUIRED') {
    return {
      status: 500,
      body: {
        error: true,
        success: false,
        message: err.message,
        code: err.code,
      },
    };
  }
  if (err?.type === 'StripeAuthenticationError') {
    return {
      status: 500,
      body: {
        error: true,
        success: false,
        message: 'Stripe API key is invalid or expired. Update STRIPE_SECRET_KEY on the server.',
        code: 'STRIPE_KEY_INVALID',
      },
    };
  }
  return {
    status: err?.statusCode || 500,
    body: {
      error: true,
      success: false,
      message: err?.message || 'Payment processing failed',
      code: err?.code || 'STRIPE_ERROR',
    },
  };
}
