import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { checkoutService } from '../services/checkout.service';
import {
  isStripePublishableKeyConfigured,
} from '../constants/config';
import { isStripeNativeModuleAvailable } from '../lib/stripeNative';
import { showError, showWarning } from '../utils/toast';

export type InAppPaymentStatus = 'paid' | 'cancelled' | 'failed';

export interface PayForOrderParams {
  orderId: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
}

export interface PayForOrderResult {
  status: InAppPaymentStatus;
  paymentIntentId?: string;
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

function StripePaymentBridge({ children }: { children: React.ReactNode }) {
  const { useStripe } = require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');
  const { confirmPayment } = useStripe();

  const payForOrder = useCallback(
    async (params: PayForOrderParams): Promise<PayForOrderResult> => {
      const { orderId, amount } = params;

      if (!isStripePublishableKeyConfigured()) {
        showError(stripeKeySetupMessage());
        return { status: 'failed' };
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        showError('Invalid payment amount.');
        return { status: 'failed' };
      }

      try {
        const intentRes = await checkoutService.createPaymentIntent(amount, orderId);
        const clientSecret = intentRes.data?.clientSecret;
        const paymentIntentId = intentRes.data?.paymentIntentId;

        if (!intentRes.success || !clientSecret) {
          showError(
            (intentRes as { message?: string }).message ||
              'Could not start secure payment. Please try again.'
          );
          return { status: 'failed' };
        }

        const { error: confirmError, paymentIntent: confirmedIntent } = await confirmPayment(
          clientSecret,
          {
            paymentMethodType: 'Card',
          }
        );

        if (confirmError) {
          if (confirmError.code === 'Canceled') {
            return { status: 'cancelled' };
          }
          showError(confirmError.message || 'Payment was not completed.');
          return { status: 'failed' };
        }

        const resolvedIntentId = confirmedIntent?.id || paymentIntentId;
        if (resolvedIntentId) {
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
        const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
        showError(message);
        return { status: 'failed' };
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
