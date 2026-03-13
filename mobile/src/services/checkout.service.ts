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

export interface CreateOrderData {
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethodId: string;
  paymentMethod: string;
  couponCode?: string;
  giftCardCode?: string;
  notes?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
  paymentIntentId?: string;
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

export const checkoutService = {
  /**
   * Get shipping rates/methods
   */
  getShippingRates: async (): Promise<ApiResponse<ShippingMethod[]>> => {
    try {
      const response = await fetchDataFromApi<ShippingMethod[]>(API_ENDPOINTS.GET_SHIPPING_RATES);
      return response;
    } catch (error) {
      // Return mock shipping methods if API fails
      return {
        success: true,
        error: false,
        data: [
          {
            _id: 'standard',
            name: 'Zuba House Regular',
            description: 'Regular delivery',
            price: 4.99,
            estimatedDays: '1-5 business days',
            carrier: 'Zuba House',
          },
          {
            _id: 'express',
            name: 'Zuba House Express',
            description: 'Faster delivery',
            price: 9.99,
            estimatedDays: '1-3 business days',
            carrier: 'Zuba House',
          },
          {
            _id: 'overnight',
            name: 'Zuba House Express (Overnight)',
            description: 'Next business day',
            price: 19.99,
            estimatedDays: '1 business day',
            carrier: 'Zuba House',
          },
        ],
      };
    }
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (couponCode: string): Promise<ApiResponse<CouponValidation>> => {
    const response = await postData<CouponValidation>(API_ENDPOINTS.VALIDATE_COUPON, { code: couponCode });
    return response;
  },

  /**
   * Apply coupon to cart
   */
  applyCoupon: async (couponCode: string, cartItems: any[], cartTotal: number): Promise<ApiResponse<{ discount: number; type: string; freeShipping?: boolean }>> => {
    const response = await postData<{ discount: number; type: string; freeShipping?: boolean }>(API_ENDPOINTS.APPLY_COUPON, { 
      code: couponCode,
      cartItems,
      cartTotal
    });
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
  applyGiftCard: async (code: string, cartTotal: number): Promise<ApiResponse<{ discount: number; giftCard: GiftCardValidation['giftCard'] }>> => {
    const response = await postData<{ discount: number; giftCard: GiftCardValidation['giftCard'] }>(API_ENDPOINTS.APPLY_GIFT_CARD, { 
      code,
      cartTotal
    });
    return response;
  },

  /**
   * Create Stripe payment intent
   */
  createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<ApiResponse<PaymentIntent>> => {
    const response = await postData<PaymentIntent>(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
      amount,
      currency,
    });
    return response;
  },

  /**
   * Create Stripe checkout session (redirects to Stripe hosted checkout)
   * Supports: Credit/Debit cards, Apple Pay, Google Pay
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
  getCheckoutStatus: async (sessionId: string): Promise<ApiResponse<{
    status: string;
    paymentStatus: string;
    amountTotal: number;
    currency: string;
  }>> => {
    const response = await fetchDataFromApi(`${API_ENDPOINTS.GET_CHECKOUT_STATUS}/${sessionId}`);
    return response;
  },

  /**
   * Create order (logged-in user with address ID)
   */
  createOrder: async (orderData: CreateOrderData): Promise<ApiResponse<any>> => {
    const response = await postData(API_ENDPOINTS.CREATE_ORDER, orderData);
    return response;
  },

  /**
   * Create order as guest (no auth, inline address and guest customer)
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
   * Calculate order totals
   */
  calculateTotals: (
    subtotal: number, 
    shippingCost: number, 
    couponDiscount: number = 0,
    giftCardDiscount: number = 0,
    taxRate: number = 0.13
  ) => {
    const totalDiscount = couponDiscount + giftCardDiscount;
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const tax = taxableAmount * taxRate;
    const total = Math.max(0, taxableAmount + tax + shippingCost);

    return {
      subtotal,
      shippingCost,
      couponDiscount,
      giftCardDiscount,
      discount: totalDiscount,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },
};
