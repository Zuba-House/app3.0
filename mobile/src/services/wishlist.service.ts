/**
 * Wishlist Service
 * Handles wishlist (MyList) API calls
 */

import { fetchDataFromApi, postData, deleteData } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Product } from '../types/product.types';
import { ApiResponse } from '../types/api.types';
import { productService } from './product.service';

const isLikelyMongoId = (value?: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(value.trim());
};

export const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetchDataFromApi<any[]>(API_ENDPOINTS.GET_WISHLIST);
    if (response.success && Array.isArray(response.data)) {
      const normalized = await Promise.all(response.data.map(async (item: any) => {
        let image = item.image || '';
        const pid = item.productId || item._id;
        const missingOrInvalidImage = !image || isLikelyMongoId(String(image));

        // Backfill image from product API when wishlist row has broken/legacy image value.
        if (missingOrInvalidImage && pid) {
          try {
            const productRes = await productService.getProductById(String(pid));
            const p: any = productRes?.success ? productRes.data : null;
            const firstImage = Array.isArray(p?.images) ? p.images[0] : undefined;
            image =
              (typeof firstImage === 'string' ? firstImage : firstImage?.url) ||
              p?.featuredImage ||
              p?.image ||
              '';
          } catch {
            // Keep graceful fallback below.
          }
        }

        return {
        _id: item.productId || item._id,
        wishlistItemId: item._id,
        productId: item.productId || item._id,
        name: item.productTitle || item.name || 'Product',
        price: Number(item.price ?? 0),
        salePrice: item.oldPrice && Number(item.oldPrice) > Number(item.price) ? Number(item.price) : undefined,
        images: image ? [image] : [],
        featuredImage: image || '',
        category: '',
        stock: 0,
        stockStatus: 'in_stock',
        status: 'published',
        productType: 'simple',
        rating: Number(item.rating ?? 0),
        reviewCount: 0,
        brand: item.brand || '',
      };
      }));
      return { ...response, data: normalized };
    }
    return response;
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (product: Product): Promise<ApiResponse> => {
    const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;
    const image =
      typeof firstImage === 'string'
        ? firstImage
        : (firstImage as any)?.url || (product as any).featuredImage || '';
    const data = {
      productId: product._id,
      productTitle: product.name,
      image,
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

