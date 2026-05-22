/**
 * API Response Types
 * Matches the backend API response format
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  error: boolean;
  data?: T;
  message?: string;
  details?: unknown;
  page?: number;
  total?: number;
  totalPages?: number;
  limit?: number;
}

export interface ApiError {
  success: false;
  error: true;
  message: string;
  details?: any;
  isAuthError?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

