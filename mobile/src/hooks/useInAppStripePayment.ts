import { useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { checkoutService } from '../services/checkout.service';
import { STRIPE_PUBLISHABLE_KEY } from '../constants/config';
import { showError } from '../utils/toast';

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

export function useInAppStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const payForOrder = useCallback(
    async (params: PayForOrderParams): Promise<PayForOrderResult> => {
      const { orderId, amount, customerEmail, customerName } = params;

      if (!STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')) {
        showError('Card payments are not configured. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to your app build.');
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

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Zuba House',
          paymentIntentClientSecret: clientSecret,
          defaultBillingDetails: {
            email: customerEmail,
            name: customerName,
          },
          allowsDelayedPaymentMethods: false,
        });

        if (initError) {
          showError(initError.message || 'Could not open the payment form.');
          return { status: 'failed' };
        }

        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            return { status: 'cancelled' };
          }
          showError(presentError.message || 'Payment was not completed.');
          return { status: 'failed' };
        }

        if (paymentIntentId) {
          try {
            await checkoutService.confirmOrderPayment(orderId, {
              paymentIntentId,
              paymentMethod: 'stripe',
              source: 'zuba_mobile_app',
            });
          } catch {
            // Webhook or retry on confirmation screen may still mark paid.
          }
        }

        return { status: 'paid', paymentIntentId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
        showError(message);
        return { status: 'failed' };
      }
    },
    [initPaymentSheet, presentPaymentSheet]
  );

  return { payForOrder, isStripeConfigured: Boolean(STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')) };
}
