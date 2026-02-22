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
  notes?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
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
            name: 'Standard Shipping',
            description: 'Delivery in 5-7 business days',
            price: 4.99,
            estimatedDays: '5-7 days',
            carrier: 'Canada Post',
          },
          {
            _id: 'express',
            name: 'Express Shipping',
            description: 'Delivery in 2-3 business days',
            price: 9.99,
            estimatedDays: '2-3 days',
            carrier: 'FedEx',
          },
          {
            _id: 'overnight',
            name: 'Overnight Shipping',
            description: 'Next business day delivery',
            price: 19.99,
            estimatedDays: '1 day',
            carrier: 'UPS',
          },
        ],
      };
    }
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (couponCode: string): Promise<ApiResponse<{ discount: number; type: string }>> => {
    const response = await postData<{ discount: number; type: string }>(API_ENDPOINTS.VALIDATE_COUPON, { code: couponCode });
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
   */
  createCheckoutSession: async (
    amount: number,
    orderId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<ApiResponse<CheckoutSession>> => {
    const response = await postData<CheckoutSession>('/api/stripe/create-checkout-session', {
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
    const response = await fetchDataFromApi(`/api/stripe/checkout-status/${sessionId}`);
    return response;
  },

  /**
   * Create order
   */
  createOrder: async (orderData: CreateOrderData): Promise<ApiResponse<any>> => {
    const response = await postData(API_ENDPOINTS.CREATE_ORDER, orderData);
    return response;
  },

  /**
   * Calculate order totals
   */
  calculateTotals: (subtotal: number, shippingCost: number, discount: number = 0, taxRate: number = 0.13) => {
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax + shippingCost;

    return {
      subtotal,
      shippingCost,
      discount,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },
};
