/**
 * Cart Slice
 * Manages shopping cart state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/cart.types';
import {
  normalizeCartItems,
  calculateTotals,
  mergeCartLineItem,
} from './cartNormalize';

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      const rawItems = Array.isArray(payload) ? payload : payload?.items;
      const items = normalizeCartItems(rawItems);
      state.items = items;
      const totals = calculateTotals(items);
      state.subtotal = totals.subtotal;
      state.shipping = totals.shipping;
      state.discount = totals.discount;
      state.total = totals.total;
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.items = mergeCartLineItem(state.items, action.payload);

      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item._id === action.payload.itemId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        item.subtotal = item.price * item.quantity;
      }
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.shipping = 0;
      state.discount = 0;
      state.total = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.subtotal;

export default cartSlice.reducer;

