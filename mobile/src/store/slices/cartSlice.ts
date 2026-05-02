/**
 * Cart Slice
 * Manages shopping cart state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Cart } from '../../types/cart.types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const normalizeCartItems = (input: any): CartItem[] => {
  if (!Array.isArray(input)) return [];
  return input.map((item: any) => {
    const price = Number(item?.price ?? 0);
    const quantity = Number(item?.quantity ?? 1);
    const subtotal = Number(item?.subtotal ?? item?.subTotal ?? price * quantity);
    const productObj =
      item?.product && typeof item.product === 'object'
        ? item.product
        : {
            _id: String(item?.productId ?? ''),
            name: String(item?.productTitle ?? 'Product'),
            images: item?.image ? [item.image] : [],
            featuredImage: item?.image || '',
          };
    const pid = item?.productId != null ? String(item.productId) : undefined;
    const vid = item?.variationId != null ? String(item.variationId) : undefined;
    return {
      _id: String(item?._id ?? `${item?.productId ?? 'item'}_${Math.random()}`),
      product: productObj,
      variation: item?.variation,
      quantity,
      price,
      subtotal,
      productId: pid,
      variationId: vid ?? null,
      productTitle: item?.productTitle ? String(item.productTitle) : undefined,
    } as CartItem;
  });
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  loading: false,
  error: null,
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = 0; // Calculated at checkout
  const discount = 0; // Applied coupon discount
  const total = subtotal + shipping - discount;

  return { subtotal, shipping, discount, total };
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

