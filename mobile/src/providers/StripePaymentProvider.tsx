import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { checkoutService } from '../services/checkout.service';
import {
  isStripePublishableKeyConfigured,
} from '../constants/config';
import { isStripeNativeModuleAvailable } from '../lib/stripeNative';
import { showError, showWarning } from '../utils/toast';

export type InAppPaymentStatus = 'paid' | 'cancelled' | 'failed';

export interface PayForOrderParams {
  orderId?: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
}

export interface PayForOrderResult {
  status: InAppPaymentStatus;
  paymentIntentId?: string;
  errorMessage?: string;
  errorCode?: string;
}

type StripePaymentContextValue = {
  payForOrder: (params: PayForOrderParams) => Promise<PayForOrderResult>;
  isStripeConfigured: boolean;
  isStripeNativeAvailable: boolean;
};

function stripeKeySetupMessage(): string {
  return (
    'Card payments are not configured in this build. ' +
    'Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to your pk_live_… key in mobile/eas.json (production env), ' +
    'then run: eas build --platform ios --profile production'
  );
}

function stubPayForOrder(reason: 'native' | 'key'): () => Promise<PayForOrderResult> {
  return async () => {
    if (reason === 'native') {
      showError(
        'This app build does not include the Stripe payment module. Install the latest TestFlight update from Zuba House.'
      );
    } else {
      showError(stripeKeySetupMessage());
    }
    return { status: 'failed' };
  };
}

const StripePaymentContext = createContext<StripePaymentContextValue>({
  payForOrder: stubPayForOrder('native'),
  isStripeConfigured: false,
  isStripeNativeAvailable: false,
});

function mapStripeError(error: { code?: string; message?: string } | null | undefined): {
  message: string;
  code?: string;
} {
  const code = String(error?.code || '').toLowerCase();
  const fallback = 'Payment was not completed. Please check your card details and try again.';

  if (!code) {
    return { message: error?.message || fallback };
  }

  const byCode: Record<string, string> = {
    canceled: 'Payment was cancelled before completion.',
    card_declined: 'Your card was declined. Please use another card or contact your bank.',
    expired_card: 'This card is expired. Please use a different card.',
    incorrect_cvc: 'The CVC code is incorrect. Please check and try again.',
    invalid_cvc: 'The CVC code is invalid. Please check and try again.',
    incorrect_number: 'The card number is incorrect. Please check and try again.',
    invalid_number: 'The card number is invalid. Please check and try again.',
    processing_error: 'Payment could not be processed right now. Please try again.',
    insufficient_funds: 'This card has insufficient funds. Please use another card.',
    authentication_required:
      'Your bank requires additional authentication for this card. Please try another card.',
    network_error: 'Network error while processing payment. Check your connection and try again.',
  };

  return {
    code,
    message: byCode[code] || error?.message || fallback,
  };
}

function StripePaymentBridge({ children }: { children: React.ReactNode }) {
  const { useStripe } = require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');
  const { confirmPayment } = useStripe();

  const payForOrder = useCallback(
    async (params: PayForOrderParams): Promise<PayForOrderResult> => {
      const { orderId, amount } = params;

      if (!isStripePublishableKeyConfigured()) {
        const errorMessage = stripeKeySetupMessage();
        showError(errorMessage);
        return { status: 'failed', errorMessage, errorCode: 'stripe_not_configured' };
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        const errorMessage = 'Invalid payment amount.';
        showError(errorMessage);
        return { status: 'failed', errorMessage, errorCode: 'invalid_amount' };
      }

      try {
        const intentRes = await checkoutService.createPaymentIntent(amount, orderId);
        const clientSecret = intentRes.data?.clientSecret;
        const paymentIntentId = intentRes.data?.paymentIntentId;

        if (!intentRes.success || !clientSecret) {
          const errorMessage =
            (intentRes as { message?: string }).message ||
            'Could not start secure payment. Please try again.';
          return { status: 'failed', errorMessage, errorCode: 'payment_intent_failed' };
        }

        const { error: confirmError, paymentIntent: confirmedIntent } = await confirmPayment(
          clientSecret,
          {
            paymentMethodType: 'Card',
          }
        );

        if (confirmError) {
          if (confirmError.code === 'Canceled') {
            const mapped = mapStripeError(confirmError);
            return { status: 'cancelled', errorMessage: mapped.message, errorCode: mapped.code };
          }
          const mapped = mapStripeError(confirmError);
          return { status: 'failed', errorMessage: mapped.message, errorCode: mapped.code };
        }

        const resolvedIntentId = confirmedIntent?.id || paymentIntentId;
        if (orderId && resolvedIntentId) {
          const confirmRes = await checkoutService.confirmOrderPayment(orderId, {
            paymentIntentId: resolvedIntentId,
            paymentMethod: 'stripe',
            source: 'zuba_mobile_app',
          });
          if (!confirmRes.success) {
            showWarning(
              'Payment received. Your order will update to Paid shortly — check Orders if it still shows pending.'
            );
          }
        }

        return { status: 'paid', paymentIntentId: resolvedIntentId };
      } catch (err: unknown) {
        const rawMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
        const networkLike = /network|timeout|internet|fetch|connection/i.test(rawMessage);
        if (networkLike) {
          const mapped = mapStripeError({ code: 'network_error', message: rawMessage });
          return { status: 'failed', errorMessage: mapped.message, errorCode: mapped.code };
        }
        return { status: 'failed', errorMessage: rawMessage, errorCode: 'payment_failed' };
      }
    },
    [confirmPayment]
  );

  const value = useMemo(
    () => ({
      payForOrder,
      isStripeConfigured: isStripePublishableKeyConfigured(),
      isStripeNativeAvailable: true,
    }),
    [payForOrder]
  );

  return <StripePaymentContext.Provider value={value}>{children}</StripePaymentContext.Provider>;
}

export function StripePaymentProvider({ children }: { children: React.ReactNode }) {
  const keyConfigured = isStripePublishableKeyConfigured();
  const nativeAvailable = isStripeNativeModuleAvailable();

  if (!nativeAvailable) {
    const value: StripePaymentContextValue = {
      payForOrder: stubPayForOrder('native'),
      isStripeConfigured: false,
      isStripeNativeAvailable: false,
    };
    return <StripePaymentContext.Provider value={value}>{children}</StripePaymentContext.Provider>;
  }

  if (!keyConfigured) {
    const value: StripePaymentContextValue = {
      payForOrder: stubPayForOrder('key'),
      isStripeConfigured: false,
      isStripeNativeAvailable: true,
    };
    return <StripePaymentContext.Provider value={value}>{children}</StripePaymentContext.Provider>;
  }

  return <StripePaymentBridge>{children}</StripePaymentBridge>;
}

export function useStripePaymentContext(): StripePaymentContextValue {
  return useContext(StripePaymentContext);
}
