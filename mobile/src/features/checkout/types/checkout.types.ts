import { Address, ShippingMethod } from '../../../types/address.types';

export type CheckoutMode = 'authenticated' | 'guest';

export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutSnapshot {
  mode: CheckoutMode;
  address: Address | null;
  shippingMethod: ShippingMethod | null;
  customer: CheckoutCustomerInfo | null;
  deliveryNote: string;
  paymentMethod: 'stripe' | 'apple_pay' | 'google_pay';
}

export interface CheckoutValidationIssue {
  field: 'address' | 'shipping' | 'cart' | 'name' | 'email' | 'phone' | 'session';
  message: string;
}

