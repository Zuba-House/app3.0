/**
 * Address Service
 * Handles all address-related API calls
 */

import { fetchDataFromApi, postData, editData, deleteData } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { Address, AddressFormData } from '../types/address.types';
import { ApiResponse } from '../types/api.types';

export const addressService = {
  /**
   * Get all user addresses
   */
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const response = await fetchDataFromApi<Address[]>(API_ENDPOINTS.GET_ADDRESSES);
    return response;
  },

  /**
   * Add new address
   */
  addAddress: async (addressData: AddressFormData): Promise<ApiResponse<Address>> => {
    const response = await postData<Address>(API_ENDPOINTS.ADD_ADDRESS, addressData);
    return response;
  },

  /**
   * Update existing address
   */
  updateAddress: async (addressId: string, addressData: Partial<AddressFormData>): Promise<ApiResponse<Address>> => {
    const response = await editData<Address>(`${API_ENDPOINTS.UPDATE_ADDRESS}/${addressId}`, addressData);
    return response;
  },

  /**
   * Delete address
   */
  deleteAddress: async (addressId: string): Promise<ApiResponse> => {
    const response = await deleteData(`${API_ENDPOINTS.DELETE_ADDRESS}/${addressId}`);
    return response;
  },

  /**
   * Set address as default
   */
  setDefaultAddress: async (addressId: string): Promise<ApiResponse<Address>> => {
    const response = await editData<Address>(`${API_ENDPOINTS.UPDATE_ADDRESS}/${addressId}`, { isDefault: true });
    return response;
  },
};
