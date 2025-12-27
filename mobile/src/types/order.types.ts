/**
 * Order Types
 * Matches the backend order model
 */

import { Address } from './user.types';
import { Product } from './product.types';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  variation?: {
    attributes: Record<string, string>;
  };
  subtotal: number;
}

export interface PaymentInfo {
  method: 'stripe' | 'paypal' | 'cod';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ShippingInfo {
  method: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  carrier?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  payment: PaymentInfo;
  shipping: ShippingInfo;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

