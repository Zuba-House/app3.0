import { Linking } from 'react-native';
import { checkoutService } from '../services/checkout.service';
import { showError, showSuccess } from '../utils/toast';
import { rootNavigationRef } from './rootNavigationRef';

export type PaymentDeepLinkResult =
  | { type: 'success'; orderId: string; sessionId?: string }
  | { type: 'cancel'; orderId?: string };

function parseQuery(url: string): URLSearchParams {
  const queryIndex = url.indexOf('?');
  if (queryIndex < 0) return new URLSearchParams();
  return new URLSearchParams(url.slice(queryIndex + 1));
}

export function parsePaymentDeepLink(url: string): PaymentDeepLinkResult | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().startsWith('zuba://')) return null;

  const withoutScheme = trimmed.slice('zuba://'.length);
  const [pathPart] = withoutScheme.split('?');
  const path = pathPart.replace(/^\/+/, '').toLowerCase();
  const params = parseQuery(trimmed);
  const orderId = String(params.get('orderId') ?? params.get('orderid') ?? '').trim();
  const sessionId = String(params.get('session_id') ?? params.get('sessionId') ?? '').trim();

  if (path === 'payment-success' || path.includes('payment-success')) {
    if (!orderId) return null;
    return { type: 'success', orderId, sessionId: sessionId || undefined };
  }

  if (path === 'payment-cancel' || path.includes('payment-cancel')) {
    return { type: 'cancel', orderId: orderId || undefined };
  }

  return null;
}

function navigateMain(screen: string, params?: Record<string, unknown>) {
  if (!rootNavigationRef.isReady()) return false;
  rootNavigationRef.navigate('MainApp', {
    screen,
    params,
  } as never);
  return true;
}

export async function handlePaymentDeepLink(url: string): Promise<boolean> {
  const link = parsePaymentDeepLink(url);
  if (!link) return false;

  if (link.type === 'cancel') {
    showError('Payment cancelled');
    navigateMain('Cart');
    return true;
  }

  if (link.sessionId) {
    try {
      await checkoutService.confirmOrderPayment(link.orderId, {
        sessionId: link.sessionId,
        paymentMethod: 'stripe',
        source: 'zuba_mobile_deep_link',
      });
    } catch (error) {
      console.warn('[PaymentDeepLink] confirm payment failed:', error);
    }
  }

  showSuccess('Payment completed successfully');
  navigateMain('OrderConfirmation', {
    orderId: link.orderId,
    total: 0,
    paymentPending: false,
  });
  return true;
}

export function subscribePaymentDeepLinks(): () => void {
  const onUrl = ({ url }: { url: string }) => {
    void handlePaymentDeepLink(url);
  };

  const subscription = Linking.addEventListener('url', onUrl);

  void Linking.getInitialURL().then((initialUrl) => {
    if (initialUrl) void handlePaymentDeepLink(initialUrl);
  });

  return () => subscription.remove();
}
