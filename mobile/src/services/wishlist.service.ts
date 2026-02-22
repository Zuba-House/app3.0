/**
 * Wishlist Service
 * Handles wishlist (MyList) API calls
 */

import { fetchDataFromApi, postData, deleteData } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Product } from '../types/product.types';
import { ApiResponse } from '../types/api.types';

export const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetchDataFromApi<any[]>(API_ENDPOINTS.GET_WISHLIST);
    return response;
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (product: Product): Promise<ApiResponse> => {
    const data = {
      productId: product._id,
      productTitle: product.name,
      image: product.images[0],
      rating: product.rating || 0,
      price: product.salePrice || product.price,
      oldPrice: product.price,
      brand: product.brand || '',
      discount: product.salePrice
        ? ((product.price - product.salePrice) / product.price) * 100
        : 0,
    };
    const response = await postData(API_ENDPOINTS.ADD_TO_WISHLIST, data);
    return response;
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (wishlistItemId: string): Promise<ApiResponse> => {
    const response = await deleteData(
      `${API_ENDPOINTS.REMOVE_FROM_WISHLIST}/${wishlistItemId}`
    );
    return response;
  },
};

