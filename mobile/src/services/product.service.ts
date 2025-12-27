/**
 * Product Service
 * Handles all product-related API calls
 */

import { fetchDataFromApi } from './api';
import { API_ENDPOINTS, PAGINATION } from '../constants/config';
import { Product, ProductFilters, Category } from '../types/product.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

export const productService = {
  /**
   * Get all products with filters
   */
  getAllProducts: async (
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product> | ApiResponse<Product[]>> => {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || PAGINATION.DEFAULT_PAGE_SIZE,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.minPrice && { minPrice: filters.minPrice }),
      ...(filters?.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.sort && { sort: filters.sort }),
    };

    const response = await fetchDataFromApi<Product[]>(
      API_ENDPOINTS.GET_ALL_PRODUCTS,
      params
    );

    return response;
  },

  /**
   * Get product by ID
   */
  getProductById: async (productId: string): Promise<ApiResponse<Product>> => {
    const response = await fetchDataFromApi<Product>(
      `${API_ENDPOINTS.GET_PRODUCT}/${productId}`
    );
    return response;
  },

  /**
   * Search products
   */
  searchProducts: async (query: string): Promise<ApiResponse<Product[]>> => {
    const response = await fetchDataFromApi<Product[]>(
      API_ENDPOINTS.SEARCH_PRODUCTS,
      { search: query }
    );
    return response;
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    categoryId: string,
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<ApiResponse<Product[]>> => {
    const response = await fetchDataFromApi<Product[]>(
      API_ENDPOINTS.GET_ALL_PRODUCTS,
      { category: categoryId, page, limit }
    );
    return response;
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await fetchDataFromApi<Product[]>(
      API_ENDPOINTS.GET_ALL_PRODUCTS,
      { featured: true, limit: 10 }
    );
    return response;
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetchDataFromApi<Category[]>(
      API_ENDPOINTS.GET_CATEGORIES
    );
    return response;
  },
};

