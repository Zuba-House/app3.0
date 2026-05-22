/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import shippingLocationReducer from './slices/shippingLocationSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shippingLocation: shippingLocationReducer,
  },
  devTools: __DEV__,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

