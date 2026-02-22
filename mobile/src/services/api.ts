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

    const fullUrl = `${API_URL}${url}`;
    console.log('🌐 Making API request:', fullUrl);
    console.log('📤 Request headers:', JSON.stringify(headers, null, 2));
    console.log('📤 Request options:', JSON.stringify(options, null, 2));

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    console.log('📥 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    let data: any;
    try {
      const rawData = await response.json();
      
      // IMMEDIATELY clean the data at the JSON level to prevent any level3 access
      // This runs BEFORE any other processing to ensure level3 is never accessed
      const cleanDataImmediately = (obj: any, depth: number = 0): any => {
        // Prevent infinite recursion
        if (depth > 10) return obj;
        if (!obj || typeof obj !== 'object') return obj;
        
        try {
          if (Array.isArray(obj)) {
            return obj.map((item: any) => {
              if (!item || typeof item !== 'object') return item;
              try {
                const cleaned: any = {};
                for (const key in item) {
                  if (item.hasOwnProperty(key)) {
                    const value = item[key];
                    
                    // CRITICAL: Handle category immediately - convert to string ID
                    // NEVER access level3 or any nested properties
                    if (key === 'category') {
                      if (value && typeof value === 'object' && value !== null) {
                        // Extract _id only - NEVER access level3 or any other property
                        cleaned[key] = (value as any)._id || null;
                      } else {
                        cleaned[key] = value;
                      }
                    } else if (key === 'categories' && Array.isArray(value)) {
                      // Clean categories array - convert objects to IDs
                      cleaned[key] = value.map((cat: any) => {
                        if (cat && typeof cat === 'object' && (cat as any)._id) {
                          return (cat as any)._id;
                        }
                        return cat;
                      });
                    } else if (value && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                      // Recursively clean nested objects (but skip category objects)
                      cleaned[key] = cleanDataImmediately(value, depth + 1);
                    } else {
                      cleaned[key] = value;
                    }
                  }
                }
                return cleaned;
              } catch (e) {
                console.warn('Error cleaning array item:', e);
                return item;
              }
            });
          } else {
            const cleaned: any = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // CRITICAL: Handle category immediately - NEVER access level3
                if (key === 'category') {
                  if (value && typeof value === 'object' && value !== null) {
                    // Extract _id only - NEVER access any other property
                    cleaned[key] = (value as any)._id || null;
                  } else {
                    cleaned[key] = value;
                  }
                } else if (key === 'categories' && Array.isArray(value)) {
                  cleaned[key] = value.map((cat: any) => {
                    if (cat && typeof cat === 'object' && (cat as any)._id) {
                      return (cat as any)._id;
                    }
                    return cat;
                  });
                } else if (value && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  cleaned[key] = cleanDataImmediately(value, depth + 1);
                } else {
                  cleaned[key] = value;
                }
              }
            }
            return cleaned;
          }
        } catch (e) {
          console.warn('Error in cleanDataImmediately:', e);
          return obj;
        }
      };
      
      data = cleanDataImmediately(rawData);
      console.log('📥 Response data (cleaned):', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }

    // Check for error response BEFORE handling 401
    // Only throw if error is explicitly true AND success is false
    if (data && data.error === true && data.success === false) {
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
    // Only treat as error if error is true AND success is false
    if (data && data.error === true && data.success === false) {
      // This is an error response
      throw new Error(data.message || 'Request failed');
    }
    
    // Also check HTTP status codes
    if (!response.ok && response.status >= 400) {
      // HTTP error status
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // Normalize response format - some endpoints return data in different fields
    // Backend sometimes returns { success: true, product: {...} } instead of { success: true, data: {...} }
    // Also handle case where data is nested or at root level
    let responseData: any = null;
    
    if (data.data !== undefined) {
      responseData = data.data;
    } else if (data.product !== undefined) {
      responseData = data.product;
    } else if (data.products !== undefined) {
      // Backend search returns products array directly
      responseData = data.products;
    } else if (data.result !== undefined) {
      responseData = data.result;
    } else if (data.user !== undefined) {
      responseData = data.user;
    } else if (!data.error && data.success !== false) {
      // If no error and success, data might be at root (but exclude error/success/message fields)
      const { error, success, message, total, page, totalPages, ...rest } = data;
      if (Object.keys(rest).length > 0) {
        responseData = rest;
      }
    }

    // Safely handle nested category data to prevent level3 errors
    const cleanCategoryData = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      try {
        const cleaned = Array.isArray(obj) ? [...obj] : { ...obj };
        
        if (Array.isArray(cleaned)) {
          return cleaned.map((item: any) => {
            if (!item || typeof item !== 'object') return item;
            
            try {
              const itemCleaned: any = {};
              
              // Copy all properties except problematic ones
              for (const key in item) {
                if (item.hasOwnProperty(key)) {
                  const value = item[key];
                  
                  // Handle category objects specially - ALWAYS convert to string ID
                  if (key === 'category' && value && typeof value === 'object') {
                    try {
                      // Always convert category object to string ID to avoid level3 errors
                      if ((value as any)._id) {
                        itemCleaned[key] = (value as any)._id;
                      } else {
                        // If no _id, try to find it or set to null
                        itemCleaned[key] = null;
                      }
                    } catch (e) {
                      // If category processing fails, set to null
                      itemCleaned[key] = null;
                    }
                  } else {
                    // Recursively clean nested objects
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                      itemCleaned[key] = cleanCategoryData(value);
                    } else {
                      itemCleaned[key] = value;
                    }
                  }
                }
              }
              
              return itemCleaned;
            } catch (e) {
              console.warn('Error cleaning item:', e);
              return item;
            }
          });
        } else {
          // Single object - clean it
          const cleanedObj: any = {};
          for (const key in cleaned) {
            if (cleaned.hasOwnProperty(key)) {
              const value = cleaned[key];
              
              if (key === 'category' && value && typeof value === 'object') {
                try {
                  // Always convert category object to string ID to avoid level3 errors
                  cleanedObj[key] = (value as any)?._id || null;
                } catch (e) {
                  cleanedObj[key] = null;
                }
              } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                cleanedObj[key] = cleanCategoryData(value);
              } else {
                cleanedObj[key] = value;
              }
            }
          }
          return cleanedObj;
        }
      } catch (e) {
        console.warn('Error in cleanCategoryData:', e);
        return obj;
      }
    };

    // Clean category data with error handling
    try {
      responseData = cleanCategoryData(responseData);
    } catch (cleanError) {
      console.warn('⚠️ Error cleaning category data, using original:', cleanError);
      // If cleaning fails, try to at least remove problematic properties
      if (responseData && typeof responseData === 'object') {
        try {
          if (Array.isArray(responseData)) {
            responseData = responseData.map((item: any) => {
              // Safely convert category to string ID without accessing level3
              if (item && item.category) {
                const { category, ...rest } = item;
                if (typeof category === 'object' && category !== null) {
                  return { ...rest, category: category._id || null };
                }
                return { ...rest, category: category };
              }
              return item;
            });
          } else if (responseData.category) {
            // Safely convert category to string ID
            const { category, ...rest } = responseData;
            if (typeof category === 'object' && category !== null) {
              responseData = { ...rest, category: category._id || null };
            } else {
              responseData = { ...rest, category: category };
            }
          }
        } catch (e) {
          console.warn('⚠️ Secondary cleanup also failed:', e);
        }
      }
    }

    const normalizedResponse: ApiResponse<T> = {
      success: data.success !== false, // Default to true if not explicitly false
      error: data.error === true,
      message: data.message,
      data: responseData,
    } as ApiResponse<T>;

    return normalizedResponse;
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
