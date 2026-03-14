/**
 * Search API — GET /api/search?q= and POST /api/search/image (Lens)
 */

import { API_URL, API_ENDPOINTS } from '../constants/config';
import { Product } from '../types/product.types';
import { ApiResponse } from '../types/api.types';

export interface SearchSuggestion {
  type: 'product' | 'category' | 'label';
  text: string;
  id?: string;
}

export interface SearchResponse {
  success: boolean;
  products: Product[];
  categories: { _id: string; name: string }[];
  suggestions: SearchSuggestion[];
  detected?: string[];
}

export const searchService = {
  /**
   * GET /api/search?q= — products + suggestions, 300ms debounce at call site
   */
  async search(query: string, limit = 50): Promise<SearchResponse> {
    const q = (query || '').trim();
    if (!q) {
      return { success: true, products: [], categories: [], suggestions: [] };
    }
    const url = `${API_URL}${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Search failed');
    }
    return {
      success: data.success !== false,
      products: data.products || [],
      categories: data.categories || [],
      suggestions: data.suggestions || [],
      detected: data.detected,
    };
  },

  /**
   * POST /api/search/image — image (Lens) search, body: { image: base64 }
   */
  async searchByImage(base64Image: string): Promise<SearchResponse> {
    if (!base64Image) {
      return { success: true, products: [], categories: [], suggestions: [] };
    }
    const url = `${API_URL}${API_ENDPOINTS.SEARCH_IMAGE}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Image search failed');
    }
    return {
      success: data.success !== false,
      products: data.products || [],
      categories: data.categories || [],
      suggestions: data.suggestions || [],
      detected: data.detected,
    };
  },
};
