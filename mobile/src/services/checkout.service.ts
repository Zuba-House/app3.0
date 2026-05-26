/**
 * Checkout Service
 * Handles checkout and payment API calls
 */

import { fetchDataFromApi, postData } from './api';
import { API_ENDPOINTS, API_URL } from '../constants/config';
import { ShippingMethod, CheckoutData } from '../types/address.types';
import { ApiResponse } from '../types/api.types';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface CreateOrderData {
  userId?: string;
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethodId: string;
  paymentMethod: string;
  idempotencyKey?: string;
  products?: any[];
  totalAmt?: number;
  shippingCost?: number;
  shippingRate?: any;
  shippingAddress?: any;
  delivery_address?: string;
  paymentId?: string;
  payment_status?: string;
  isGuestOrder?: boolean;
  guestCustomer?: {
    name: string;
    email: string;
    phone: string;
  };
  customerName?: string;
  phone?: string;
  couponCode?: string;
  giftCardCode?: string;
  deliveryNote?: string;
  notes?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
  paymentIntentId?: string;
}

export interface ConfirmOrderPaymentPayload {
  sessionId?: string;
  paymentIntentId?: string;
  paymentMethod?: string;
  source?: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    minimumAmount?: number;
    freeShipping?: boolean;
  };
  error?: string;
}

export interface GiftCardValidation {
  valid: boolean;
  giftCard?: {
    code: string;
    currentBalance: number;
    currency: string;
  };
  error?: string;
}

/** Matches web cart: city + country are enough to request API fallback/zone rates. */
export function hasMinimalShippingDestination(shippingAddress?: Record<string, any> | null): boolean {
  if (!shippingAddress || typeof shippingAddress !== 'object') return false;
  const city = String(shippingAddress.city || shippingAddress.address?.city || '').trim();
  const countryCode = String(
    shippingAddress.countryCode || shippingAddress.address?.countryCode || ''
  ).trim();
  return Boolean(city && city !== '—' && countryCode);
}

/** Full address required at order placement (not for showing estimated rates). */
export function isValidShippingAddress(shippingAddress?: Record<string, any> | null): boolean {
  if (!shippingAddress || typeof shippingAddress !== 'object') return false;
  const city = String(shippingAddress.city || shippingAddress.address?.city || '').trim();
  const countryCode = String(
    shippingAddress.countryCode || shippingAddress.address?.countryCode || ''
  ).trim();
  const postal = String(
    shippingAddress.postalCode ||
      shippingAddress.postal_code ||
      shippingAddress.address?.postalCode ||
      ''
  ).trim();
  const addressLine1 = String(
    shippingAddress.addressLine1 || shippingAddress.address?.addressLine1 || ''
  ).trim();
  return Boolean(city && city !== '—' && addressLine1 && addressLine1 !== 'Address pending' && (postal || countryCode));
}

export type ShippingLocationHint = {
  countryCode?: string | null;
  countryName?: string | null;
  city?: string | null;
  region?: string | null;
};

/** Build destination for /api/shipping/rates — same minimal fields as zuba-web2.0 cart. */
export function resolveShippingAddressForRates(
  shippingAddress?: Record<string, any> | null,
  locationHint?: ShippingLocationHint | null
): Record<string, any> | null {
  const addr = shippingAddress && typeof shippingAddress === 'object' ? shippingAddress : {};
  const countryCode =
    String(addr.countryCode || addr.address?.countryCode || locationHint?.countryCode || 'CA').trim() ||
    'CA';
  const city =
    String(addr.city || addr.address?.city || locationHint?.city || '').trim() ||
    (countryCode === 'CA' ? 'Toronto' : countryCode === 'US' ? 'New York' : 'City');
  const merged = {
    ...addr,
    city,
    countryCode,
    country: addr.country || addr.address?.country || locationHint?.countryName || countryCode,
    addressLine1: addr.addressLine1 || addr.address?.addressLine1 || '',
    postalCode: addr.postalCode || addr.postal_code || addr.address?.postalCode || '',
  };
  return hasMinimalShippingDestination(merged) ? merged : null;
}

/** Normalize address for shipping rate API. */
export function addressToShippingPayload(address: Record<string, any>): Record<string, any> {
  const addr: any = address;
  return {
    firstName: addr.contactInfo?.firstName || addr.name?.split(' ')[0] || '',
    lastName: addr.contactInfo?.lastName || addr.name?.split(' ').slice(1).join(' ') || '',
    addressLine1: addr.addressLine1 || addr.address?.addressLine1 || '',
    addressLine2: addr.addressLine2 || addr.address?.addressLine2 || '',
    city: addr.city || addr.address?.city || '',
    province: addr.state || addr.province || addr.provinceCode || addr.address?.province || '',
    provinceCode: addr.provinceCode || addr.state?.slice(0, 2)?.toUpperCase() || '',
    postalCode: addr.postalCode || addr.postal_code || addr.address?.postalCode || '',
    postal_code: addr.postalCode || addr.postal_code || addr.address?.postalCode || '',
    country: addr.country || addr.address?.country || '',
    countryCode: addr.countryCode || addr.address?.countryCode || 'CA',
    phone: addr.phone || addr.mobile || addr.contactInfo?.phone || '',
  };
}

/** Build cart lines with product weights for accurate API calculation. */
export function buildCartItemsForShipping(cartItems: any[] = []) {
  return cartItems.map((item) => ({
    productId: item.productId || item.product?._id || item._id,
    quantity: item.quantity || 1,
    product: {
      name: item.product?.name || item.productTitle || 'Product',
      shipping: {
        weight: item.product?.shipping?.weight ?? item.product?.inventory?.weight ?? 0.5,
        weightUnit: item.product?.shipping?.weightUnit || 'kg',
        dimensions: item.product?.shipping?.dimensions,
      },
    },
  }));
}

function mapRatesPayload(raw: { standard?: any; express?: any }): ShippingMethod[] {
  const methods: ShippingMethod[] = [];
  if (raw?.standard) {
    methods.push({
      _id: 'standard',
      name: raw.standard.name || 'Zuba House Regular',
      description: raw.standard.delivery || raw.standard.estimatedDelivery || 'Regular delivery',
      price: Number(raw.standard.cost) || 0,
      estimatedDays: raw.standard.delivery || raw.standard.estimatedDelivery || '5-10 business days',
      carrier: raw.standard.carrier || 'Zuba House',
    });
  }
  if (raw?.express) {
    methods.push({
      _id: 'express',
      name: raw.express.name || 'Zuba House Express',
      description: raw.express.delivery || raw.express.estimatedDelivery || 'Faster delivery',
      price: Number(raw.express.cost) || 0,
      estimatedDays: raw.express.delivery || raw.express.estimatedDelivery || '2-5 business days',
      carrier: raw.express.carrier || 'Zuba House',
    });
  }
  return methods;
}

export const checkoutService = {
  /**
   * Get shipping rates/methods (POST /api/shipping/rates)
   */
  getShippingRates: async (
    cartItems: any[] = [],
    shippingAddress?: Record<string, any> | null,
    locationHint?: ShippingLocationHint | null
  ): Promise<ApiResponse<ShippingMethod[]> & { estimated?: boolean }> => {
    if (!cartItems?.length) {
      throw new Error('Your cart is empty.');
    }

    const destination = resolveShippingAddressForRates(shippingAddress, locationHint);
    if (!destination) {
      throw new Error('Enter your city and country to see shipping options.');
    }

    const estimated = !isValidShippingAddress(destination);

    const payload = {
      cartItems: buildCartItemsForShipping(cartItems),
      shippingAddress: addressToShippingPayload(destination),
    };

    const response = await postData<{ standard?: any; express?: any }>(
      API_ENDPOINTS.GET_SHIPPING_RATES,
      payload
    );

    const raw = response.data as { standard?: any; express?: any } | undefined;
    if (!response.success || !raw?.standard || !raw?.express) {
      throw new Error(
        response.message || 'No shipping options available for this address.'
      );
    }

    const methods = mapRatesPayload(raw);
    if (methods.length === 0) {
      throw new Error('No shipping options available for this address.');
    }

    return { ...response, data: methods, estimated };
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (couponCode: string): Promise<ApiResponse<CouponValidation>> => {
    const response = await postData<CouponValidation>(API_ENDPOINTS.VALIDATE_COUPON, {
      code: couponCode,
      platform: 'mobile',
    });
    return response;
  },

  /**
   * Apply coupon to cart
   */
  applyCoupon: async (
    couponCode: string,
    cartItems: any[],
    cartTotal: number
  ): Promise<ApiResponse<{ discount: number; type: string; freeShipping?: boolean }>> => {
    const response = await postData<{ discount: number; type: string; freeShipping?: boolean }>(
      API_ENDPOINTS.APPLY_COUPON,
      {
        code: couponCode,
        cartItems,
        cartTotal,
        platform: 'mobile',
      }
    );
    return response;
  },

  /**
   * Validate gift card code
   */
  validateGiftCard: async (code: string): Promise<ApiResponse<GiftCardValidation>> => {
    const response = await postData<GiftCardValidation>(API_ENDPOINTS.VALIDATE_GIFT_CARD, { code });
    return response;
  },

  /**
   * Apply gift card to cart
   */
  applyGiftCard: async (
    code: string,
    cartTotal: number
  ): Promise<ApiResponse<{ discount: number; giftCard: GiftCardValidation['giftCard'] }>> => {
    const response = await postData<{ discount: number; giftCard: GiftCardValidation['giftCard'] }>(
      API_ENDPOINTS.APPLY_GIFT_CARD,
      {
        code,
        cartTotal,
      }
    );
    return response;
  },

  /**
   * Create Stripe payment intent
   */
  createPaymentIntent: async (
    amount: number,
    orderId?: string,
    options?: {
      saveCard?: boolean;
      customerEmail?: string;
      customerName?: string;
      paymentMethodId?: string;
    }
  ): Promise<ApiResponse<PaymentIntent>> => {
    const response = await postData<PaymentIntent>(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
      amount,
      orderId,
      saveCard: options?.saveCard,
      customerEmail: options?.customerEmail,
      customerName: options?.customerName,
      paymentMethodId: options?.paymentMethodId,
    });
    return response;
  },

  getSavedPaymentMethods: async (): Promise<
    ApiResponse<{ paymentMethods: SavedPaymentMethod[] }>
  > => {
    return fetchDataFromApi<{ paymentMethods: SavedPaymentMethod[] }>(
      API_ENDPOINTS.GET_SAVED_PAYMENT_METHODS
    );
  },

  /**
   * Create Stripe checkout session (redirects to Stripe hosted checkout)
   */
  createCheckoutSession: async (
    amount: number,
    orderId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<ApiResponse<CheckoutSession>> => {
    const response = await postData<CheckoutSession>(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
      amount,
      orderId,
      successUrl,
      cancelUrl,
      metadata: {
        orderId,
        source: 'mobile_app',
      },
    });
    return response;
  },

  /**
   * Get checkout session status
   */
  getCheckoutStatus: async (
    sessionId: string
  ): Promise<
    ApiResponse<{
      status: string;
      paymentStatus: string;
      amountTotal: number;
      currency: string;
    }>
  > => {
    const response = await fetchDataFromApi<{
      status: string;
      paymentStatus: string;
      amountTotal: number;
      currency: string;
    }>(`${API_ENDPOINTS.GET_CHECKOUT_STATUS}/${sessionId}`);
    return response;
  },

  /**
   * Confirm order payment after Stripe reports paid
   */
  confirmOrderPayment: async (
    orderId: string,
    payload: ConfirmOrderPaymentPayload
  ): Promise<ApiResponse<any>> => {
    return postData(`${API_ENDPOINTS.CONFIRM_ORDER_PAYMENT}/${orderId}`, payload);
  },

  /**
   * Create order (logged-in user with address ID)
   */
  createOrder: async (orderData: CreateOrderData): Promise<ApiResponse<any>> => {
    const response = await postData(API_ENDPOINTS.CREATE_ORDER, orderData);
    return response;
  },

  /**
   * Create order as guest
   */
  createGuestOrder: async (payload: {
    products: Array<{ productId?: string; _id?: string; price: number; quantity: number; subTotal?: number }>;
    shippingAddress: Record<string, any>;
    guestCustomer: { name: string; email: string; phone: string };
    totalAmt: number;
    shippingCost: number;
    shippingRate?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await postData(API_ENDPOINTS.CREATE_ORDER, {
      isGuestOrder: true,
      products: payload.products.map((p) => ({
        productId: p.productId || p._id,
        price: p.price,
        quantity: p.quantity,
        subTotal: p.subTotal ?? p.price * p.quantity,
      })),
      shippingAddress: payload.shippingAddress,
      guestCustomer: payload.guestCustomer,
      totalAmt: payload.totalAmt,
      shippingCost: payload.shippingCost,
      shippingRate: payload.shippingRate,
    });
    return response;
  },

  /**
   * Calculate order totals (honors freeShipping on coupon)
   */
  calculateTotals: (
    subtotal: number,
    shippingCost: number,
    couponDiscount: number = 0,
    giftCardDiscount: number = 0,
    freeShipping: boolean = false
  ) => {
    const finalShippingCost = freeShipping ? 0 : shippingCost;
    const totalDiscount = couponDiscount + giftCardDiscount;
    const payableAmount = Math.max(0, subtotal - totalDiscount);
    const total = Math.max(0, payableAmount + finalShippingCost);

    return {
      subtotal,
      shippingCost: finalShippingCost,
      couponDiscount,
      giftCardDiscount,
      discount: totalDiscount,
      total: Math.round(total * 100) / 100,
    };
  },
};
