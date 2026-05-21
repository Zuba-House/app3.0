/**
 * Order Service
 * Handles all order-related API calls
 */

import { fetchDataFromApi, postData } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Order } from '../types/order.types';
import { ApiResponse } from '../types/api.types';
import { parseOrdersListPayload, type RawOrder } from '../utils/order.mappers';

function isRouteNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return message.includes('not found') || message.includes('route get');
}

export const orderService = {
  /**
   * Get user's orders
   */
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await fetchDataFromApi<unknown>(
      `${API_ENDPOINTS.GET_ORDERS}?page=1&limit=50`
    );
    const orders = parseOrdersListPayload(response.data);
    if (__DEV__) {
      const sample = orders[0];
      console.log('[Orders] list sample:', sample ? {
        _id: sample._id,
        totalAmt: sample.totalAmt,
        products: Array.isArray(sample.products) ? sample.products.length : 0,
      } : 'empty');
    }
    return { ...response, data: orders as unknown as Order[] };
  },

  /**
   * Get order by ID — primary route, with list fallback when production lacks GET /:id
   */
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetchDataFromApi<unknown>(`${API_ENDPOINTS.GET_ORDER}/${orderId}`);
      const payload = response.data as unknown;
      const order =
        payload && typeof payload === 'object' && payload !== null && 'order' in payload
          ? (payload as { order: Order }).order
          : (payload as Order);
      return { ...response, data: order };
    } catch (error) {
      if (!isRouteNotFoundError(error)) {
        throw error;
      }
      if (__DEV__) {
        console.warn('[Orders] GET /api/order/:id unavailable — falling back to order list');
      }
      const listResponse = await orderService.getOrders();
      const list = parseOrdersListPayload(listResponse.data);
      const match = list.find((o) => String(o._id) === orderId);
      if (!match) {
        throw new Error('Could not load order details. Please try again.');
      }
      return {
        success: true,
        error: false,
        message: listResponse.message,
        data: match as unknown as Order,
      };
    }
  },

  /**
   * Create order
   */
  createOrder: async (orderData: {
    items: any[];
    shippingAddress: any;
    paymentMethod: string;
    shippingMethod?: any;
    couponCode?: string;
  }): Promise<ApiResponse<Order>> => {
    const response = await postData<Order>(API_ENDPOINTS.CREATE_ORDER, orderData);
    return response;
  },
};
