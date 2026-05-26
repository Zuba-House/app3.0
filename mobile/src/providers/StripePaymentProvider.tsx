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
  saveCard?: boolean;
  paymentMethodId?: string;
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

function mapStripeError(error: { code?: string; message?: string; declineCode?: string; localizedMessage?: string } | null | undefined): {
  message: string;
  code?: string;
} {
  const rawMessage = String(error?.localizedMessage || error?.message || '').trim();
  const code = String(error?.code || '').toLowerCase();
  const declineCode = String((error as any)?.declineCode || (error as any)?.decline_code || '').toLowerCase();
  const fallback = 'Payment was not completed. Please check your card details and try again.';

  if (/card details not complete/i.test(rawMessage)) {
    return {
      code: 'card_incomplete',
      message: 'Please enter your full card number, expiry, CVC, and postal code on the Payment step.',
    };
  }

  const byDeclineCode: Record<string, string> = {
    insufficient_funds: 'This card has insufficient funds. Please use another card.',
    lost_card: 'This card cannot be used. Please contact your bank or use another card.',
    stolen_card: 'This card cannot be used. Please contact your bank or use another card.',
    expired_card: 'This card is expired. Please use a different card.',
    incorrect_cvc: 'The CVC code is incorrect. Please check and try again.',
    incorrect_number: 'The card number is incorrect. Please check and try again.',
    invalid_cvc: 'The CVC code is invalid. Please check and try again.',
    invalid_number: 'The card number is invalid. Please check and try again.',
    processing_error: 'Payment could not be processed right now. Please try again.',
    generic_decline: 'Your card was declined. Please use another card or contact your bank.',
    do_not_honor: 'Your bank declined this payment. Please contact your bank or use another card.',
    transaction_not_allowed: 'This card does not allow this type of purchase. Try another card.',
    try_again_later: 'Your bank temporarily declined this payment. Please try again in a few minutes.',
    card_not_supported: 'This card type is not supported. Please use Visa, Mastercard, or Amex.',
    currency_not_supported: 'This card does not support payments in this currency.',
  };

  if (declineCode && byDeclineCode[declineCode]) {
    return { code: declineCode, message: byDeclineCode[declineCode] };
  }

  if (!code) {
    return { message: rawMessage || fallback };
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
      'Your bank requires additional verification for this card. Please try another card.',
    network_error: 'Network error while processing payment. Check your connection and try again.',
    failed: rawMessage || fallback,
  };

  return {
    code,
    message: byCode[code] || rawMessage || fallback,
  };
}

function StripePaymentBridge({ children }: { children: React.ReactNode }) {
  const { useStripe } = require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');
  const { confirmPayment } = useStripe();

  const payForOrder = useCallback(
    async (params: PayForOrderParams): Promise<PayForOrderResult> => {
      const { orderId, amount, customerEmail, customerName, saveCard, paymentMethodId } = params;

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
        const intentRes = await checkoutService.createPaymentIntent(amount, orderId, {
          saveCard,
          customerEmail,
          customerName,
          paymentMethodId,
        });
        const clientSecret = intentRes.data?.clientSecret;
        const paymentIntentId = intentRes.data?.paymentIntentId;

        if (!intentRes.success || !clientSecret) {
          const errorMessage =
            (intentRes as { message?: string }).message ||
            'Could not start secure payment. Please try again.';
          return { status: 'failed', errorMessage, errorCode: 'payment_intent_failed' };
        }

        const confirmParams = paymentMethodId
          ? {
              paymentMethodType: 'Card' as const,
              paymentMethodData: { paymentMethodId },
            }
          : { paymentMethodType: 'Card' as const };

        const { error: confirmError, paymentIntent: confirmedIntent } = await confirmPayment(
          clientSecret,
          confirmParams
        );

        if (confirmError) {
          if (confirmError.code === 'Canceled') {
            const mapped = mapStripeError(confirmError);
            return { status: 'cancelled', errorMessage: mapped.message, errorCode: mapped.code };
          }
          const mapped = mapStripeError(confirmError);
          return { status: 'failed', errorMessage: mapped.message, errorCode: mapped.code };
        }

        const intentStatus = String(confirmedIntent?.status || '').toLowerCase();
        if (intentStatus && intentStatus !== 'succeeded' && intentStatus !== 'processing') {
          const mapped = mapStripeError({
            code: 'failed',
            message: `Payment status: ${intentStatus}. Please try again or use another card.`,
          });
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
