import { CheckoutSnapshot } from '../types/checkout.types';

let state: CheckoutSnapshot = {
  mode: 'guest',
  address: null,
  shippingMethod: null,
  customer: null,
  deliveryNote: '',
  paymentMethod: 'stripe',
};

const listeners = new Set<() => void>();

export const checkoutStore = {
  getState: (): CheckoutSnapshot => state,
  setState: (patch: Partial<CheckoutSnapshot>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset: () => {
    state = {
      mode: 'guest',
      address: null,
      shippingMethod: null,
      customer: null,
      deliveryNote: '',
      paymentMethod: 'stripe',
    };
    listeners.forEach((listener) => listener());
  },
};

