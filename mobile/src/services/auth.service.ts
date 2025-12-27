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

      // Store tokens and user
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(user)],
      ]);

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

    if (response.success && response.data) {
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(user)],
      ]);

      return response.data;
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

