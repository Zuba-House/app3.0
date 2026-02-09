/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  postData,
  fetchDataFromApi,
  editData,
} from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authService = {
  /**
   * User login
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await postData<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      const { accessToken, refreshToken, user } = response.data;

      // Validate tokens exist before storing
      if (!accessToken || !user) {
        throw new Error(response.message || 'Invalid login response');
      }

      // Store tokens and user (only if values are defined)
      const itemsToStore: [string, string][] = [];
      if (accessToken) itemsToStore.push([STORAGE_KEYS.ACCESS_TOKEN, accessToken]);
      if (refreshToken) itemsToStore.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
      if (user) itemsToStore.push([STORAGE_KEYS.USER, JSON.stringify(user)]);

      if (itemsToStore.length > 0) {
        await AsyncStorage.multiSet(itemsToStore);
      }

      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  },

  /**
   * User registration
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await postData<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data
    );

    // Handle different response structures
    let authData: AuthResponse;
    
    if (response.success && response.data) {
      // Check if data is directly AuthResponse or nested
      if (response.data.accessToken && response.data.user) {
        authData = response.data as AuthResponse;
      } else if ((response.data as any).accessToken) {
        authData = response.data as AuthResponse;
      } else {
        // Try to extract from nested structure
        const nested = response.data as any;
        authData = {
          accessToken: nested.accessToken || nested.token || '',
          refreshToken: nested.refreshToken || nested.refresh || '',
          user: nested.user || nested.data || nested,
        };
      }

      // Validate we have required fields
      if (!authData.accessToken || !authData.user) {
        throw new Error(response.message || 'Invalid registration response');
      }

      // Validate tokens exist before storing
      if (!authData.accessToken || !authData.user) {
        throw new Error(response.message || 'Invalid registration response');
      }

      // Store tokens and user (only if values are defined)
      const itemsToStore: [string, string][] = [];
      if (authData.accessToken) itemsToStore.push([STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken]);
      if (authData.refreshToken) itemsToStore.push([STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken]);
      if (authData.user) itemsToStore.push([STORAGE_KEYS.USER, JSON.stringify(authData.user)]);

      if (itemsToStore.length > 0) {
        await AsyncStorage.multiSet(itemsToStore);
      }

      return authData;
    }

    // Handle error response from API
    if (response.error === true && response.message) {
      throw new Error(response.message);
    }

    throw new Error(response.message || 'Registration failed');
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint (optional - backend may not require it)
      await postData(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await fetchDataFromApi<User>(API_ENDPOINTS.GET_CURRENT_USER);

    if (response.success && response.data) {
      // Update stored user
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.data)
      );
      return response.data;
    }

    throw new Error(response.message || 'Failed to get user');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await editData<User>(API_ENDPOINTS.UPDATE_PROFILE, data);

    if (response.success && response.data) {
      // Update stored user
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.data)
      );
      return response.data;
    }

    throw new Error(response.message || 'Failed to update profile');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return false;

      // Optionally validate token by calling getCurrentUser
      // For now, just check if token exists
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get stored user
   */
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userJson) {
        return JSON.parse(userJson) as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },
};

