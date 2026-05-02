/**
 * Order Service
 * Handles all order-related API calls
 */

import { fetchDataFromApi, postData } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Order } from '../types/order.types';
import { ApiResponse } from '../types/api.types';

export const orderService = {
  /**
   * Get user's orders
   */
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await fetchDataFromApi<Order[]>(
      `${API_ENDPOINTS.GET_ORDERS}?page=1&limit=50`
    );
    const payload = response.data as unknown;
    let orders: Order[] = [];
    if (Array.isArray(payload)) {
      orders = payload as Order[];
    } else if (payload && typeof payload === 'object' && 'orders' in (payload as object)) {
      const o = (payload as { orders?: Order[] }).orders;
      orders = Array.isArray(o) ? o : [];
    }
    return { ...response, data: orders };
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await fetchDataFromApi<Order>(
      `${API_ENDPOINTS.GET_ORDER}/${orderId}`
    );
    const payload = response.data as unknown;
    const order =
      payload && typeof payload === 'object' && payload !== null && 'order' in payload
        ? (payload as { order: Order }).order
        : (payload as Order);
    return { ...response, data: order };
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

