/**
 * Redux Store Configuration
 */

import { configureStore, isAnyOf } from '@reduxjs/toolkit';
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  setCart,
  clearCart,
} from './slices/cartSlice';
import shippingLocationReducer from './slices/shippingLocationSlice';
import { authManager } from '../core/auth/authManager';
import { persistGuestCart } from '../utils/guestCart';
import type { CartItem } from '../types/cart.types';

const guestCartPersistListener = (storeApi: { getState: () => { cart: { items: CartItem[] } } }) => {
  return (next: (action: unknown) => unknown) => (action: unknown) => {
    const result = next(action);
    if (
      isAnyOf(addItem, removeItem, updateQuantity, setCart, clearCart)(action) &&
      !authManager.getAccessToken()
    ) {
      const items = storeApi.getState().cart.items;
      persistGuestCart(items);
    }
    return result;
  };
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shippingLocation: shippingLocationReducer,
  },
  devTools: __DEV__,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(guestCartPersistListener),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

