import { API_URL } from '../constants/config';
import { authManager } from '../core/auth/authManager';
import { ApiResponse } from '../types/api.types';

type RequestConfig = RequestInit & { _retryCount?: number };
const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeResponse<T>(raw: any): ApiResponse<T> {
  const data = raw?.data ?? raw?.product ?? raw?.products ?? raw?.result ?? raw?.user ?? raw?.address ?? null;
  return {
    success: raw?.success !== false,
    error: raw?.error === true,
    message: raw?.message,
    data: (data ?? raw) as T,
  };
}

async function request<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
  const retryCount = config._retryCount ?? 0;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };
  const accessToken = authManager.getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }
  if (__DEV__ && url.includes('/api/order/create')) {
    console.info('[Checkout][request]', {
      url,
      method: config.method || 'GET',
      hasAuthHeader: Boolean((headers as Record<string, string>).Authorization),
      hasBody: Boolean(config.body),
    });
  }
  const response = await fetchWithTimeout(`${API_URL}${url}`, { ...config, headers });
  const json = await response.json().catch(() => ({}));
  if (__DEV__ && url.includes('/api/order/create')) {
    console.info('[Checkout][response]', {
      url,
      status: response.status,
      ok: response.ok,
      message: json?.message,
    });
  }
  if (response.status === 401 && retryCount < 1) {
    const refreshed = await authManager.refreshSession();
    if (!refreshed) {
      await authManager.forceLogout('request_refresh_failed');
      throw new Error('Session expired');
    }
    return request<T>(url, { ...config, _retryCount: retryCount + 1 });
  }
  if (!response.ok || (json?.success === false && json?.error === true)) {
    throw new Error(json?.message || 'Request failed');
  }
  return normalizeResponse<T>(json);
}

export const fetchDataFromApi = async <T = unknown>(url: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return request<T>(`${url}${queryString}`, { method: 'GET' });
};

export const postData = async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
  return request<T>(url, { method: 'POST', body: JSON.stringify(data ?? {}) });
};

export const editData = async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
  return request<T>(url, { method: 'PUT', body: JSON.stringify(data ?? {}) });
};

export const deleteData = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  return request<T>(url, { method: 'DELETE' });
};

export const uploadImage = async (file: any): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const headers: HeadersInit = {};
  const accessToken = authManager.getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }
  const response = await fetchWithTimeout(`${API_URL}/api/media/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const json = await response.json();
  return normalizeResponse(json);
};

export default {
  get: fetchDataFromApi,
  post: postData,
  put: editData,
  delete: deleteData,
};
