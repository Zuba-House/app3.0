/**
 * Category Service
 * Handles category-related API calls
 */

import { fetchDataFromApi } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { ApiResponse } from '../types/api.types';

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetchDataFromApi<Category[]>(API_ENDPOINTS.GET_CATEGORIES);
    return response;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId: string): Promise<ApiResponse<Category>> => {
    const response = await fetchDataFromApi<Category>(`${API_ENDPOINTS.GET_CATEGORIES}/${categoryId}`);
    return response;
  },
};
