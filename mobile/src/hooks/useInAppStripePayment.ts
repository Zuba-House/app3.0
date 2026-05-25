import {
  useStripePaymentContext,
  type InAppPaymentStatus,
  type PayForOrderParams,
  type PayForOrderResult,
} from '../providers/StripePaymentProvider';

export type { InAppPaymentStatus, PayForOrderParams, PayForOrderResult };

export function useInAppStripePayment() {
  const { payForOrder, isStripeConfigured, isStripeNativeAvailable } = useStripePaymentContext();
  return { payForOrder, isStripeConfigured, isStripeNativeAvailable };
}
