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
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

