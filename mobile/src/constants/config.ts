/**

 * App Configuration

 */



import Constants from 'expo-constants';



function resolveApiBaseUrl(): string {

  const trim = (u: string) => u.replace(/\/+$/, '');

  const fromPublic = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (fromPublic) return trim(fromPublic);

  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl?.trim();

  if (fromExtra) return trim(fromExtra);

  const legacy = process.env.API_URL?.trim();

  if (legacy) return trim(legacy);

  return 'https://zuba-api.onrender.com';

}



export const API_URL = resolveApiBaseUrl();



function resolveStripePublishableKey(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    '';
  if (fromEnv) return fromEnv;
  const fromExtra = (Constants.expoConfig?.extra as { stripePublishableKey?: string } | undefined)
    ?.stripePublishableKey?.trim();
  return fromExtra || '';
}

export const STRIPE_PUBLISHABLE_KEY = resolveStripePublishableKey();

/** True when a real Stripe publishable key is baked into the build (not a placeholder). */
export function isStripePublishableKeyConfigured(key: string = STRIPE_PUBLISHABLE_KEY): boolean {
  const value = key?.trim() || '';
  if (!value.startsWith('pk_')) return false;
  if (value.includes('REPLACE_ME')) return false;
  return value.length >= 20;
}



export const APP_NAME = process.env.APP_NAME || 'Zuba House';

export const APP_VERSION =

  Constants.expoConfig?.version || process.env.APP_VERSION || '1.0.0';



export const SOCIAL_LINKS = {

  instagram: 'https://www.instagram.com/zuba_house',

  twitter: 'https://x.com/zubainfo',

  facebook: 'https://www.facebook.com/p/Zuba-House-61559578310001/',

  tiktok: 'https://www.tiktok.com/@zubahouse',

  email: 'mailto:support@zubahouse.com',

  website: 'https://zubahouse.com',

  whatsapp: '',

} as const;



export const LEGAL_URLS = {

  privacy: 'https://zubahouse.com/privacy-policy',

  terms: 'https://zubahouse.com/terms',

  privacyFallback: 'https://zuba-api.onrender.com/privacy',

  termsFallback: 'https://zuba-api.onrender.com/terms',

} as const;



export const API_ENDPOINTS = {

  LOGIN: '/api/user/login',

  REGISTER: '/api/user/register',

  REFRESH_TOKEN: '/api/user/refresh-token',

  LOGOUT: '/api/user/logout',

  GET_CURRENT_USER: '/api/user/me',

  UPDATE_PROFILE: '/api/user/me',

  VERIFY_EMAIL: '/api/user/verifyEmail',

  FORGOT_PASSWORD: '/api/user/forgot-password',

  VERIFY_FORGOT_PASSWORD_OTP: '/api/user/verify-forgot-password-otp',

  RESET_PASSWORD: '/api/user/reset-password',

  CHANGE_PASSWORD: '/api/user/forgot-password/change-password',

  FORGOT_PASSWORD_CHANGE_PASSWORD: '/api/user/forgot-password/change-password',

  DELETE_ACCOUNT: '/api/user/delete-account',

  AUTH_WITH_GOOGLE: '/api/user/authWithGoogle',

  REGISTER_PUSH_TOKEN: '/api/notifications/register-token',
  UNREGISTER_PUSH_TOKEN: '/api/notifications/unregister-token',

  GET_ALL_PRODUCTS: '/api/product/getAllProducts',

  GET_FEATURED_PRODUCTS: '/api/product/getAllFeaturedProducts',

  GET_PRODUCT: '/api/product',

  SEARCH_PRODUCTS: '/api/product/getAllProducts',

  SEARCH: '/api/search',

  SEARCH_IMAGE: '/api/search/image',

  GET_CATEGORIES: '/api/category',

  GET_CART: '/api/cart/get',

  ADD_TO_CART: '/api/cart/add',

  UPDATE_CART_ITEM: '/api/cart',

  REMOVE_FROM_CART: '/api/cart',

  GET_ORDERS: '/api/order/order-list/orders',

  GET_ORDER: '/api/order',

  CREATE_ORDER: '/api/order/create',

  CONFIRM_ORDER_PAYMENT: '/api/order/confirm-payment',

  GET_ADDRESSES: '/api/address/get',

  ADD_ADDRESS: '/api/address/add',

  UPDATE_ADDRESS: '/api/address',

  DELETE_ADDRESS: '/api/address',

  GET_WISHLIST: '/api/myList',

  ADD_TO_WISHLIST: '/api/myList/add',

  REMOVE_FROM_WISHLIST: '/api/myList',

  UPLOAD_IMAGE: '/api/media/upload',

  VALIDATE_COUPON: '/api/coupons/validate',

  APPLY_COUPON: '/api/coupons/apply',

  GET_COUPONS: '/api/coupons',

  VALIDATE_GIFT_CARD: '/api/gift-cards/validate',

  APPLY_GIFT_CARD: '/api/gift-cards/apply',

  GET_MY_GIFT_CARDS: '/api/gift-cards/my-cards',

  GET_SHIPPING_RATES: '/api/shipping/rates',

  ADDRESS_AUTOCOMPLETE: '/api/shipping/address-autocomplete',

  ADDRESS_DETAILS: '/api/shipping/address-details',

  PARSE_PHONE: '/api/shipping/parse-phone',

  VALIDATE_PHONE: '/api/shipping/validate-phone',

  CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',

  CREATE_CHECKOUT_SESSION: '/api/stripe/create-checkout-session',

  GET_CHECKOUT_STATUS: '/api/stripe/checkout-status',

} as const;



export const STORAGE_KEYS = {

  ACCESS_TOKEN: 'accessToken',

  REFRESH_TOKEN: 'refreshToken',

  USER: 'user',

  CART: 'cart',

  WISHLIST_LOCAL: 'wishlist_local',

  RECENT_SEARCHES: 'recentSearches',

  SHIPPING_LOCATION: 'shippingLocation',

  APP_LANGUAGE: 'app_language',

  APP_CURRENCY: 'app_currency',

  DARK_MODE: 'dark_mode',

  NOTIFICATION_PREFERENCES: 'notification_preferences',

  PRIVACY_SETTINGS: 'privacy_settings',

} as const;



export type CurrencyCode = 'CAD' | 'USD' | 'EUR';

export const APP_CURRENCIES: CurrencyCode[] = ['CAD', 'USD', 'EUR'];

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; rate: number; symbol: string }[] = [
  { code: 'CAD', label: 'CAD — Canadian Dollar', rate: 1, symbol: 'CA$' },
  { code: 'USD', label: 'USD — US Dollar', rate: 0.74, symbol: 'US$' },
  { code: 'EUR', label: 'EUR — Euro', rate: 0.68, symbol: '€' },
];



export type LanguageCode = 'en' | 'fr' | 'rw' | 'sw';



export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; enabled: boolean }[] = [

  { code: 'en', label: 'English', enabled: true },

  { code: 'fr', label: 'French / Français', enabled: true },

  { code: 'rw', label: 'Kinyarwanda', enabled: false },

  { code: 'sw', label: 'Swahili', enabled: false },

];



export const PAGINATION = {

  DEFAULT_PAGE_SIZE: 50,

  MAX_PAGE_SIZE: 200,

  HOME_PAGE_SIZE: 60,

  LIST_PAGE_SIZE: 50,

} as const;



export const CART = {

  MAX_QUANTITY: 99,

  MIN_QUANTITY: 1,

} as const;



export const FREE_SHIPPING_THRESHOLD = 200;



export const ERROR_MESSAGES = {

  NETWORK_ERROR: 'Please check your internet connection',

  SERVER_ERROR: 'Something went wrong. Please try again',

  AUTH_ERROR: 'Please login to continue',

  NOT_FOUND: 'Product not found',

  INVALID_CREDENTIALS: 'Invalid email or password',

  EMAIL_EXISTS: 'Email already exists',

} as const;


