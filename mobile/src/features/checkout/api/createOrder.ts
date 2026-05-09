import { checkoutService, CreateOrderData } from '../../../services/checkout.service';
import { ApiResponse } from '../../../types/api.types';

function shouldRetryWithoutGuestCustomer(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return message.includes('isguestorder') && message.includes('cast to boolean failed');
}

function toSafeGuestCustomer(payload: CreateOrderData) {
  const name = String(payload.guestCustomer?.name || payload.customerName || 'Customer').trim();
  const emailCandidate = String(payload.guestCustomer?.email || '').trim().toLowerCase();
  const email = emailCandidate && emailCandidate.includes('@') ? emailCandidate : 'customer@zubahouse.local';
  const phoneCandidate = String(payload.guestCustomer?.phone || payload.phone || '').trim();
  const phone = phoneCandidate.replace(/\D/g, '').length >= 7 ? phoneCandidate : '0000000000';
  return { name, email, phone };
}

export async function createCheckoutOrder(payload: CreateOrderData): Promise<ApiResponse<any>> {
  try {
    return await checkoutService.createOrder(payload);
  } catch (error) {
    if (!shouldRetryWithoutGuestCustomer(error)) {
      throw error;
    }

    // Deployed backend compatibility:
    // some versions mishandle authenticated `isGuestOrder: false` and cast `guestCustomer` into `isGuestOrder`.
    // For mobile app only, retry once with guest-compatible shape while preserving all order details.
    const safeGuestCustomer = toSafeGuestCustomer(payload);
    const retryPayload: CreateOrderData = {
      ...payload,
      isGuestOrder: true,
      guestCustomer: safeGuestCustomer,
      customerName: payload.customerName || safeGuestCustomer.name,
      phone: payload.phone || safeGuestCustomer.phone,
      notes: `${String(payload.notes || '')} [MOBILE_COMPAT_RETRY]`.trim(),
    };
    return checkoutService.createOrder(retryPayload);
  }
}

