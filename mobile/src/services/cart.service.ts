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
import { productService } from './product.service';
import { Product } from '../types/product.types';

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
    variation?: any,
    productSnapshot?: Product
  ): Promise<ApiResponse<Cart>> => {
    // Build required cart payload fields expected by backend
    // If product details are not provided by caller, fetch them
    let product: Product | null = productSnapshot || null;
    if (!product) {
      try {
        const res = await productService.getProductById(productId);
        if (res?.success && res.data) {
          product = res.data as Product;
        }
      } catch {
        // ignore, will fallback to minimal payload (server will reject if required fields missing)
      }
    }

    // Resolve image URL helper
    const getImageUrl = (img: any): string | undefined => {
      if (!img) return undefined;
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && (img as any).url) return (img as any).url as string;
      return undefined;
    };

    // Compute price/display fields
    const basePrice = variation?.salePrice ?? variation?.price ?? product?.salePrice ?? product?.price ?? 0;
    const originalPrice = variation?.price ?? (product?.salePrice ? product?.price : undefined);
    const discount =
      originalPrice && basePrice
        ? Math.max(0, Math.round(((Number(originalPrice) - Number(basePrice)) / Number(originalPrice)) * 100))
        : 0;

    // Compute stock
    const stockFromVariation =
      variation && typeof variation.stock !== 'undefined' && variation.stock !== null
        ? Number(variation.stock)
        : undefined;
    const stockFromProduct =
      (product as any)?.inventory?.endlessStock
        ? 999
        : Number(
            (product as any)?.inventory?.stock ?? (product as any)?.countInStock ?? (product as any)?.stock ?? 0
          );
    const countInStock = stockFromVariation ?? stockFromProduct ?? 0;

    // Brand normalization
    const brand =
      typeof (product as any)?.brand === 'string'
        ? (product as any)?.brand
        : (product as any)?.brand?.name ?? (product as any)?.brand?._id ?? '';

    const firstImg =
      (product?.images && product.images.length > 0 && getImageUrl(product.images[0])) ||
      ((product as any)?.featuredImage as string | undefined);

    const data: any = {
      productId,
      quantity,
      // Required by backend schema
      productTitle: product?.name || (variation?.name as string) || 'Product',
      image: firstImg || '',
      rating: Number(product?.rating ?? 0),
      price: Number(basePrice) || 0,
      oldPrice: originalPrice ? Number(originalPrice) : null,
      subTotal: Number(basePrice) * Number(quantity || 1),
      countInStock,
      discount,
      brand,
      productType: product?.productType || (variationId ? 'variable' : 'simple'),
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

