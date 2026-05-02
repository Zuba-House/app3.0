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
import { setAuthTokens, clearAuthTokens, getAccessToken } from '../utils/tokenStorage';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authService = {
  getGuestCartForMerge: async (): Promise<any[]> => {
    try {
      const cartJson = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (!cartJson) return [];
      const parsed = JSON.parse(cartJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * User login
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const guestCart = await authService.getGuestCartForMerge();
    const response = await postData<any>(
      API_ENDPOINTS.LOGIN,
      {
        ...credentials,
        guestCart,
      }
    );

    // Logging disabled for production - uncomment for debugging
    // console.log('🔐 Login response:', JSON.stringify(response, null, 2));

    // Backend returns: { success: true, error: false, message: "Login successfully", data: { accesstoken, refreshToken } }
    // Note: backend uses "accesstoken" (lowercase) not "accessToken"
    if (response.success && response.data) {
      const data = response.data;
      // Handle both accessToken and accesstoken (backend uses lowercase)
      const accessToken = data.accessToken || data.accesstoken;
      const refreshToken = data.refreshToken || data.refreshToken;

      if (!accessToken) {
        throw new Error(response.message || 'Invalid login response - no token');
      }

      await setAuthTokens(accessToken, refreshToken || '');

      // Fetch user details separately (backend doesn't return user in login response)
      try {
        // Logging disabled for production - uncomment for debugging
        // console.log('🔍 Fetching user details with token:', accessToken.substring(0, 20) + '...');
        const userResponse = await fetchDataFromApi<User>(API_ENDPOINTS.GET_CURRENT_USER);
        // Logging disabled for production - uncomment for debugging
        // console.log('👤 User details response:', JSON.stringify(userResponse, null, 2));
        
        if (userResponse.success && userResponse.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));
          await AsyncStorage.removeItem(STORAGE_KEYS.CART);
          return {
            accessToken,
            refreshToken: refreshToken || '',
            user: userResponse.data,
          };
        } else {
          console.warn('⚠️ User details response not successful:', userResponse);
        }
      } catch (userError: any) {
        console.error('❌ Error fetching user after login:', userError);
        console.error('❌ Error message:', userError.message);
        // If we can't fetch user, still return tokens (user can be fetched later)
      }

      // Return with tokens even if user fetch failed
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
      return {
        accessToken,
        refreshToken: refreshToken || '',
        user: {} as User, // Will be fetched later
      };
    }

    // Handle error response
    if (response.error === true && response.message) {
      throw new Error(response.message);
    }

    throw new Error(response.message || 'Login failed');
  },

  /**
   * User registration
   */
  register: async (data: RegisterData): Promise<any> => {
    const response = await postData<any>(
      API_ENDPOINTS.REGISTER,
      data
    );

    if (response.success) {
      const dataPayload = response.data || {};
      const accessToken = dataPayload.accessToken || dataPayload.accesstoken;
      const refreshToken = dataPayload.refreshToken || '';
      const user = dataPayload.user;

      // Some environments auto-login on register. Persist auth when returned.
      if (accessToken && user) {
        const authData: AuthResponse = {
          accessToken,
          refreshToken,
          user,
        };

        await setAuthTokens(accessToken, refreshToken || '');
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return authData;
      }

      // Verification-required flow: registration succeeded but OTP/email verification is pending.
      return {
        success: true,
        error: false,
        message: response.message || 'Registration successful. Please verify your email.',
        requiresEmailVerification: true,
      };
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
      await clearAuthTokens();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
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
      const token = await getAccessToken();
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

  /**
   * Google OAuth: send authorization code to backend (secure; client_secret stays on server).
   */
  loginWithGoogleCode: async (code: string, redirectUri: string): Promise<AuthResponse> => {
    const guestCart = await authService.getGuestCartForMerge();
    const response = await postData<any>(API_ENDPOINTS.GOOGLE_AUTH_CODE, {
      code,
      redirect_uri: redirectUri,
      guestCart,
    });

    if (response.success && response.data) {
      const data = response.data;
      const accessToken = data.accessToken || data.accesstoken;
      const refreshToken = data.refreshToken || data.refreshToken;
      const userData = data.user;

      if (!accessToken) {
        throw new Error(response.message || 'Invalid Google auth response');
      }

      const itemsToStore: [string, string][] = [
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ''],
      ];
      if (userData) {
        itemsToStore.push([STORAGE_KEYS.USER, JSON.stringify(userData)]);
      }
      await AsyncStorage.multiSet(itemsToStore);

      if (userData && userData._id && userData.email) {
        return {
          accessToken,
          refreshToken: refreshToken || '',
          user: userData as User,
        };
      }
      try {
        const userResponse = await fetchDataFromApi<User>(API_ENDPOINTS.GET_CURRENT_USER);
        if (userResponse.success && userResponse.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));
          return {
            accessToken,
            refreshToken: refreshToken || '',
            user: userResponse.data,
          };
        }
      } catch {
        // ignore
      }
      return {
        accessToken,
        refreshToken: refreshToken || '',
        user: {} as User,
      };
    }

    throw new Error(response.message || 'Google authentication failed');
  },

  /**
   * Google OAuth login/signup (legacy: app sends profile; prefer loginWithGoogleCode).
   */
  loginWithGoogle: async (googleData: {
    name: string;
    email: string;
    avatar?: string;
    mobile?: string;
  }): Promise<AuthResponse> => {
    const guestCart = await authService.getGuestCartForMerge();
    const response = await postData<any>(
      API_ENDPOINTS.GOOGLE_AUTH,
      {
        name: googleData.name,
        email: googleData.email,
        avatar: googleData.avatar,
        mobile: googleData.mobile,
        password: '',
        role: 'USER',
        guestCart,
      }
    );

    if (response.success && response.data) {
      const data = response.data;
      const accessToken = data.accessToken || data.accesstoken;
      const refreshToken = data.refreshToken || data.refreshToken;

      if (!accessToken) {
        throw new Error(response.message || 'Invalid Google auth response');
      }

      await setAuthTokens(accessToken, refreshToken || '');

      try {
        const userResponse = await fetchDataFromApi<User>(API_ENDPOINTS.GET_CURRENT_USER);
        if (userResponse.success && userResponse.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));
          await AsyncStorage.removeItem(STORAGE_KEYS.CART);
          return {
            accessToken,
            refreshToken: refreshToken || '',
            user: userResponse.data,
          };
        }
      } catch (userError) {
        console.error('Error fetching user after Google login:', userError);
      }

      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
      return {
        accessToken,
        refreshToken: refreshToken || '',
        user: {} as User,
      };
    }

    throw new Error(response.message || 'Google authentication failed');
  },

  /**
   * Verify email OTP (after registration)
   */
  verifyEmail: async (email: string, otp: string): Promise<ApiResponse> => {
    const response = await postData(API_ENDPOINTS.VERIFY_EMAIL, { email, otp });
    return response;
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await postData(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response;
  },

  /**
   * Verify password reset OTP
   */
  verifyForgotPasswordOtp: async (email: string, otp: string): Promise<ApiResponse> => {
    const response = await postData(API_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, { email, otp });
    return response;
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string, newPassword: string, confirmPassword: string, oldPassword?: string): Promise<ApiResponse> => {
    const response = await postData(API_ENDPOINTS.RESET_PASSWORD, {
      email,
      newPassword,
      confirmPassword,
      ...(oldPassword && { oldPassword }),
    });
    return response;
  },
};

