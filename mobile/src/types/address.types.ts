/**
 * Address Types
 * Type definitions for addresses
 */

export interface Address {
  _id: string;
  userId?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  /** ISO country code when known (e.g. CA, US) */
  countryCode?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressFormData {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ShippingMethod {
  _id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier?: string;
}

export interface CheckoutData {
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: 'stripe' | 'paypal';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
}
