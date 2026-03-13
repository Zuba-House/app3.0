/**
 * Cart Slice
 * Manages shopping cart state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Cart } from '../../types/cart.types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  loading: false,
  error: null,
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1; // 10% tax (adjust as needed)
  const shipping = 0; // Calculated at checkout
  const discount = 0; // Applied coupon discount
  const total = subtotal + tax + shipping - discount;

  return { subtotal, tax, shipping, discount, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.items = action.payload.items;
      const totals = calculateTotals(action.payload.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.shipping = totals.shipping;
      state.discount = totals.discount;
      state.total = totals.total;
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => {
          if (item._id === action.payload._id) return true;
          if (typeof item.product === 'object' &&
              typeof action.payload.product === 'object' &&
              item.product._id === action.payload.product._id) {
            const itemVarId = typeof item.variation === 'object' ? item.variation?._id : null;
            const payloadVarId = typeof action.payload.variation === 'object' ? action.payload.variation?._id : null;
            return itemVarId === payloadVarId;
          }
          return false;
        }
      );

      if (existingIndex >= 0) {
        const existingItem = state.items[existingIndex];
        existingItem.quantity += action.payload.quantity;
        existingItem.subtotal = existingItem.price * existingItem.quantity;
        state.items.splice(existingIndex, 1);
        state.items.unshift(existingItem);
      } else {
        state.items.unshift(action.payload);
      }

      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
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
      state.tax = totals.tax;
      state.total = totals.total;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
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

