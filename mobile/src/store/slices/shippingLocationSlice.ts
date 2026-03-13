/**
 * Shipping location slice – country/region for shipping (auto-detect + manual)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShippingLocationState {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
}

const initialState: ShippingLocationState = {
  countryCode: null,
  countryName: null,
  region: null,
  city: null,
};

const shippingLocationSlice = createSlice({
  name: 'shippingLocation',
  initialState,
  reducers: {
    setShippingLocation: (state, action: PayloadAction<ShippingLocationState>) => {
      state.countryCode = action.payload.countryCode;
      state.countryName = action.payload.countryName;
      state.region = action.payload.region ?? null;
      state.city = action.payload.city ?? null;
    },
    clearShippingLocation: (state) => {
      state.countryCode = null;
      state.countryName = null;
      state.region = null;
      state.city = null;
    },
  },
});

export const { setShippingLocation, clearShippingLocation } = shippingLocationSlice.actions;
export default shippingLocationSlice.reducer;
