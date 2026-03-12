/**
 * Product Service
 * Handles all product-related API calls
 */

import { fetchDataFromApi, postData } from './api';
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
   * Backend expects POST with { query } in body and returns { products } array
   */
  searchProducts: async (query: string): Promise<ApiResponse<Product[]>> => {
    try {
      // Backend search endpoint expects POST with query in body
      const response = await postData<any>(
        '/api/product/search/get',
        { query: query, page: 1, limit: 50 }
      );
      
      // Logging disabled for production - uncomment for debugging
      // console.log('🔍 Search response:', JSON.stringify(response, null, 2));
      
      // Backend returns { success: true, products: [...] }
      if (response.success) {
        // Handle different response formats
        let products: Product[] = [];
        
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data && Array.isArray(response.data.products)) {
          products = response.data.products;
        } else if ((response as any).products && Array.isArray((response as any).products)) {
          products = (response as any).products;
        } else if (response.data && typeof response.data === 'object' && (response.data as any).products) {
          products = (response.data as any).products;
        }
        
        return {
          success: true,
          error: false,
          data: products,
          message: response.message,
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('Search error:', error);
      // Fallback: try GET with query params
      try {
        const fallbackResponse = await fetchDataFromApi<Product[]>(
          API_ENDPOINTS.GET_ALL_PRODUCTS,
          { search: query, query: query, name: query, limit: 50 }
        );
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        throw error;
      }
    }
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
   * Get products by brand
   */
  getProductsByBrand: async (
    brand: string,
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<ApiResponse<Product[]>> => {
    try {
      // Use the filters endpoint similar to web client
      const response = await postData<any>(
        '/api/product/filters',
        { brand: [brand], page, limit }
      );
      
      if (response?.error === false && (response as any)?.products) {
        return {
          success: true,
          error: false,
          data: (response as any).products,
          message: response.message || 'Products fetched successfully',
        };
      }
      
      return {
        success: false,
        error: true,
        data: [],
        message: response?.message || 'Failed to fetch products',
      };
    } catch (error: any) {
      console.error('Error fetching products by brand:', error);
      // Fallback: try GET with brand query param
      try {
        const fallbackResponse = await fetchDataFromApi<Product[]>(
          API_ENDPOINTS.GET_ALL_PRODUCTS,
          { brand, page, limit }
        );
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback brand filter also failed:', fallbackError);
        throw error;
      }
    }
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

