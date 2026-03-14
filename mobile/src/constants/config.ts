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
  GET_CURRENT_USER: '/api/user/user-details',
  UPDATE_PROFILE: '/api/user/me',
  GOOGLE_AUTH: '/api/user/authWithGoogle',
  GOOGLE_AUTH_CODE: '/api/user/auth/google',
  VERIFY_EMAIL: '/api/user/verifyEmail',
  FORGOT_PASSWORD: '/api/user/forgot-password',
  VERIFY_FORGOT_PASSWORD_OTP: '/api/user/verify-forgot-password-otp',
  RESET_PASSWORD: '/api/user/reset-password',

  // Products
  GET_ALL_PRODUCTS: '/api/product/getAllProducts',
  GET_PRODUCT: '/api/product',
  SEARCH_PRODUCTS: '/api/product/getAllProducts',
  SEARCH: '/api/search',
  SEARCH_IMAGE: '/api/search/image',

  // Categories
  GET_CATEGORIES: '/api/category',

  // Cart
  GET_CART: '/api/cart/get',
  ADD_TO_CART: '/api/cart/add',
  UPDATE_CART_ITEM: '/api/cart',
  REMOVE_FROM_CART: '/api/cart',

  // Orders
  GET_ORDERS: '/api/order/order-list',
  GET_ORDER: '/api/order',
  CREATE_ORDER: '/api/order/create',

  // Address
  GET_ADDRESSES: '/api/address/get',
  ADD_ADDRESS: '/api/address/add',
  UPDATE_ADDRESS: '/api/address',
  DELETE_ADDRESS: '/api/address',

  // Wishlist
  GET_WISHLIST: '/api/myList',
  ADD_TO_WISHLIST: '/api/myList/add',
  REMOVE_FROM_WISHLIST: '/api/myList',

  // Media
  UPLOAD_IMAGE: '/api/media/upload',

  // Coupons
  VALIDATE_COUPON: '/api/coupons/validate',
  APPLY_COUPON: '/api/coupons/apply',
  GET_COUPONS: '/api/coupons',

  // Gift Cards
  VALIDATE_GIFT_CARD: '/api/gift-cards/validate',
  APPLY_GIFT_CARD: '/api/gift-cards/apply',
  GET_MY_GIFT_CARDS: '/api/gift-cards/my-cards',

  // Shipping (rates + address/phone autocomplete, same as web via backend)
  GET_SHIPPING_RATES: '/api/shipping/rates',
  ADDRESS_AUTOCOMPLETE: '/api/shipping/address-autocomplete',
  ADDRESS_DETAILS: '/api/shipping/address-details',
  PARSE_PHONE: '/api/shipping/parse-phone',
  VALIDATE_PHONE: '/api/shipping/validate-phone',

  // Payment
  CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
  CREATE_CHECKOUT_SESSION: '/api/stripe/create-checkout-session',
  GET_CHECKOUT_STATUS: '/api/stripe/checkout-status',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  RECENT_SEARCHES: 'recentSearches',
  SHIPPING_LOCATION: 'shippingLocation',
} as const;

// App Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50, // Increased to show more products
  MAX_PAGE_SIZE: 200, // Increased max limit
} as const;

export const CART = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
} as const;

/** Order total above this amount (exclusive) gets free shipping */
export const FREE_SHIPPING_THRESHOLD = 200;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection',
  SERVER_ERROR: 'Something went wrong. Please try again',
  AUTH_ERROR: 'Please login to continue',
  NOT_FOUND: 'Product not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
} as const;

