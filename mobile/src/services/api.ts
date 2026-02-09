/**
 * API Client
 * Handles all HTTP requests with automatic token management
 * Uses fetch API (React Native compatible) instead of axios
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../constants/config';
import { ApiResponse, ApiError } from '../types/api.types';

// Request queue for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to make API requests
const makeRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Check for error response BEFORE handling 401
    if (data && data.error === true) {
      // This is an error response (e.g., email already exists)
      throw new Error(data.message || 'Request failed');
    }

    // Handle token expiration (401)
    if (response.status === 401 && !options.headers?.['X-Retry']) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken: string | null) => {
            if (newToken) {
              headers.Authorization = `Bearer ${newToken}`;
            }
            return makeRequest<T>(url, {
              ...options,
              headers: { ...headers, 'X-Retry': 'true' },
            });
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!refreshToken) {
          // No refresh token, logout user
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
          ]);
          processQueue(new Error('No refresh token'), null);
          throw new Error('No refresh token');
        }

        // Call refresh token endpoint
        const refreshResponse = await fetch(
          `${API_URL}/api/user/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const refreshData = (await refreshResponse.json()) as ApiResponse<{
          accessToken: string;
        }>;

        if (refreshData.success && refreshData.data?.accessToken) {
          const newAccessToken = refreshData.data.accessToken;
          await AsyncStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            newAccessToken
          );

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          headers.Authorization = `Bearer ${newAccessToken}`;
          return makeRequest<T>(url, {
            ...options,
            headers: { ...headers, 'X-Retry': 'true' },
          });
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        throw refreshError;
      }
    }

    // Check if response indicates error
    if (!response.ok || (data && data.error === true)) {
      // Return error response
      const errorResponse = data as ApiResponse<T>;
      if (errorResponse.message) {
        throw new Error(errorResponse.message);
      }
      throw new Error('Request failed');
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    // Handle network errors
    if (error.message === 'Network request failed') {
      throw {
        success: false,
        error: true,
        message: 'Network error. Please check your internet connection.',
      } as ApiResponse<T>;
    }
    throw error;
  }
};

// Helper functions
export const fetchDataFromApi = async <T = any>(
  url: string,
  params?: any
): Promise<ApiResponse<T>> => {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return makeRequest<T>(`${url}${queryString}`, {
    method: 'GET',
  });
};

export const postData = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const editData = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteData = async <T = any>(
  url: string
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, {
    method: 'DELETE',
  });
};

// File upload
export const uploadImage = async (file: any): Promise<ApiResponse> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    return data as ApiResponse;
  } catch (error: any) {
    throw {
      success: false,
      error: true,
      message: 'Failed to upload image',
    } as ApiResponse;
  }
};

// Export default for compatibility
const apiClient = {
  get: fetchDataFromApi,
  post: postData,
  put: editData,
  delete: deleteData,
};

export default apiClient;
