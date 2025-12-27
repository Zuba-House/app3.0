/**
 * App Configuration
 * Loads environment variables and provides app-wide constants
 */

// API Configuration
export const API_URL = process.env.API_URL || 'https://zuba-api.onrender.com';

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

// App Info
export const APP_NAME = process.env.APP_NAME || 'Zuba';
export const APP_VERSION = process.env.APP_VERSION || '1.0.0';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/user/login',
  REGISTER: '/api/user/register',
  REFRESH_TOKEN: '/api/user/refresh-token',
  LOGOUT: '/api/user/logout',
  GET_CURRENT_USER: '/api/user/me',
  UPDATE_PROFILE: '/api/user/me',

  // Products
  GET_ALL_PRODUCTS: '/api/product/getAllProducts',
  GET_PRODUCT: '/api/product',
  SEARCH_PRODUCTS: '/api/product/getAllProducts',

  // Categories
  GET_CATEGORIES: '/api/category',

  // Cart
  GET_CART: '/api/cart',
  ADD_TO_CART: '/api/cart/add',
  UPDATE_CART_ITEM: '/api/cart',
  REMOVE_FROM_CART: '/api/cart',

  // Orders
  GET_ORDERS: '/api/order',
  GET_ORDER: '/api/order',
  CREATE_ORDER: '/api/order/create',

  // Address
  GET_ADDRESSES: '/api/address',
  ADD_ADDRESS: '/api/address',
  UPDATE_ADDRESS: '/api/address',
  DELETE_ADDRESS: '/api/address',

  // Wishlist
  GET_WISHLIST: '/api/myList',
  ADD_TO_WISHLIST: '/api/myList/add',
  REMOVE_FROM_WISHLIST: '/api/myList',

  // Media
  UPLOAD_IMAGE: '/api/media/upload',

  // Coupons
  VALIDATE_COUPON: '/api/coupons',
  GET_COUPONS: '/api/coupons',

  // Shipping
  GET_SHIPPING_RATES: '/api/shipping/rates',

  // Payment
  CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  RECENT_SEARCHES: 'recentSearches',
} as const;

// App Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const CART = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection',
  SERVER_ERROR: 'Something went wrong. Please try again',
  AUTH_ERROR: 'Please login to continue',
  NOT_FOUND: 'Product not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
} as const;

