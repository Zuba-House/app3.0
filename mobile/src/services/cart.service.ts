/**
 * Cart Service
 * Handles all cart-related API calls
 */

import {
  fetchDataFromApi,
  postData,
  editData,
  deleteData,
} from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Cart, CartItem } from '../types/cart.types';
import { ApiResponse } from '../types/api.types';

export const cartService = {
  /**
   * Get user's cart
   */
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await fetchDataFromApi<Cart>(API_ENDPOINTS.GET_CART);
    return response;
  },

  /**
   * Add item to cart
   */
  addToCart: async (
    productId: string,
    quantity: number = 1,
    variationId?: string,
    variation?: any
  ): Promise<ApiResponse<Cart>> => {
    const data: any = {
      productId,
      quantity,
    };

    if (variationId) {
      data.variationId = variationId;
    }

    if (variation) {
      data.variation = variation;
    }

    const response = await postData<Cart>(API_ENDPOINTS.ADD_TO_CART, data);
    return response;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    cartItemId: string,
    quantity: number
  ): Promise<ApiResponse<Cart>> => {
    const data = {
      qty: quantity,
    };
    const response = await editData<Cart>(
      `${API_ENDPOINTS.UPDATE_CART_ITEM}/update-qty`,
      { _id: cartItemId, ...data }
    );
    return response;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (
    cartItemId: string
  ): Promise<ApiResponse<Cart>> => {
    const response = await deleteData<Cart>(
      `${API_ENDPOINTS.REMOVE_FROM_CART}/delete-cart-item/${cartItemId}`
    );
    return response;
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<ApiResponse> => {
    // Get all cart items first, then delete each
    const cartResponse = await cartService.getCart();
    if (cartResponse.success && cartResponse.data?.items) {
      const deletePromises = cartResponse.data.items.map((item) =>
        cartService.removeFromCart(item._id)
      );
      await Promise.all(deletePromises);
    }
    return { success: true, error: false };
  },
};

