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
    const response = await fetchDataFromApi<Order[]>(API_ENDPOINTS.GET_ORDERS);
    return response;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await fetchDataFromApi<Order>(
      `${API_ENDPOINTS.GET_ORDER}/${orderId}`
    );
    return response;
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

