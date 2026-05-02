/**
 * Cart Types
 * Matches the backend cart model
 */

import { Product, ProductVariation } from './product.types';

export interface CartItem {
  _id: string;
  product: Product | string;
  quantity: number;
  variation?: ProductVariation | string;
  price: number;
  subtotal: number;
  /** Present on server cart rows — kept for checkout / order APIs */
  productId?: string;
  variationId?: string | null;
  productTitle?: string;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

