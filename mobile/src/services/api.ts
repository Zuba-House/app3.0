/**
 * API Client
 * Handles all HTTP requests with automatic token management
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../constants/config';
import { ApiResponse, ApiError } from '../types/api.types';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Request Interceptor: Add JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle token expiration (401)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string | null) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
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
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_URL}/api/user/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const responseData = response.data as ApiResponse<{
          accessToken: string;
        }>;

        if (responseData.success && responseData.data?.accessToken) {
          const newAccessToken = responseData.data.accessToken;
          await AsyncStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            newAccessToken
          );

          // Update original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          return apiClient(originalRequest);
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const fetchDataFromApi = async <T = any>(
  url: string,
  params?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiResponse<T>;
    }
    throw error;
  }
};

export const postData = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiResponse<T>;
    }
    throw error;
  }
};

export const editData = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiResponse<T>;
    }
    throw error;
  }
};

export const deleteData = async <T = any>(
  url: string
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiResponse<T>;
    }
    throw error;
  }
};

// File upload
export const uploadImage = async (file: any): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiResponse;
    }
    throw error;
  }
};

export default apiClient;

