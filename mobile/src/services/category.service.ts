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
    try {
      const response = await fetchDataFromApi<Category[]>(API_ENDPOINTS.GET_CATEGORIES);
      
      // Additional cleaning of categories to ensure no level3 issues
      if (response.success && response.data) {
        const categories = Array.isArray(response.data) ? response.data : [];
        const cleanedCategories = categories
          .filter((cat: any) => cat && cat._id && cat.name)
          .map((cat: any) => {
            // Create a completely clean category object
            const cleaned: Category = {
              _id: String(cat._id),
              name: String(cat.name),
              slug: cat.slug ? String(cat.slug) : '',
            };
            if (cat.description) cleaned.description = String(cat.description);
            if (cat.image) cleaned.image = String(cat.image);
            if (cat.icon) cleaned.icon = String(cat.icon);
            // Explicitly do NOT copy any other properties
            return cleaned;
          });
        
        return {
          ...response,
          data: cleanedCategories,
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('Category service error:', error);
      return {
        success: false,
        error: true,
        message: error.message || 'Failed to load categories',
        data: [],
      };
    }
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId: string): Promise<ApiResponse<Category>> => {
    const response = await fetchDataFromApi<Category>(`${API_ENDPOINTS.GET_CATEGORIES}/${categoryId}`);
    return response;
  },
};
