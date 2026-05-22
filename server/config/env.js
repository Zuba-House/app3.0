import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);
const splitCsv = (value) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export const env = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv: normalize(process.env.NODE_ENV) || 'development',

  mongodbUri:
    normalize(process.env.MONGODB_URI) ||
    normalize(process.env.MONGODB_URL) ||
    normalize(process.env.MONGO_URI),
  mongodbLocalUri: normalize(process.env.MONGODB_LOCAL_URI),

  jwtAccessSecret: normalize(process.env.SECRET_KEY_ACCESS_TOKEN),
  jwtRefreshSecret: normalize(process.env.SECRET_KEY_REFRESH_TOKEN),
  jwtLegacySecret: normalize(process.env.JSON_WEB_TOKEN_SECRET_KEY),
  jwtAnalyticsSalt: normalize(process.env.JWT_SECRET_KEY),
  accessTokenExpiresIn: normalize(process.env.ACCESS_TOKEN_EXPIRES_IN) || '15m',
  refreshTokenExpiresIn: normalize(process.env.REFRESH_TOKEN_EXPIRES_IN) || '7d',

  otpExpiryMinutes: parseNumber(process.env.OTP_EXPIRY_MINUTES, 10),

  sendgridApiKey: normalize(process.env.SENDGRID_API_KEY),
  emailFrom: normalize(process.env.EMAIL_FROM || process.env.EMAIL || process.env.EMAIL_USER),
  emailSenderName: normalize(process.env.EMAIL_SENDER_NAME) || 'Zuba House',
  testEmail: normalize(process.env.TEST_EMAIL),

  cloudinaryCloudName: normalize(process.env.cloudinary_Config_Cloud_Name),
  cloudinaryApiKey: normalize(process.env.cloudinary_Config_api_key),
  cloudinaryApiSecret: normalize(process.env.cloudinary_Config_api_secret),

  frontendUrl: normalize(process.env.FRONTEND_URL),
  adminUrl: normalize(process.env.ADMIN_URL),
  vendorUrl: normalize(process.env.VENDOR_URL),
  clientUrl: normalize(process.env.CLIENT_URL),
  apiUrl: normalize(process.env.API_URL),
  backendUrl: normalize(process.env.BACKEND_URL),
  cookieDomain: normalize(process.env.COOKIE_DOMAIN) || undefined,

  googleMapsApiKey: normalize(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY),
  googleVisionApiKey: normalize(process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_CLOUD_VISION_API_KEY),
  googleClientId: normalize(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: normalize(process.env.GOOGLE_CLIENT_SECRET),
  /** Optional native OAuth client IDs (PKCE-only exchange; no secret). Allowlist for google_client_id body. */
  googleIosClientId: normalize(process.env.GOOGLE_IOS_CLIENT_ID),
  googleAndroidClientId: normalize(process.env.GOOGLE_ANDROID_CLIENT_ID),
  /** Fallback redirect if client omits redirect_uri — must match native app scheme (e.g. zuba://redirect). */
  googleOAuthRedirectUri: normalize(process.env.GOOGLE_OAUTH_REDIRECT_URI) || 'zuba://redirect',
  /** Allow-list of redirects for dev, EAS, and store builds (comma-separated). */
  googleOAuthRedirectUris: splitCsv(process.env.GOOGLE_OAUTH_REDIRECT_URIS || 'zuba://redirect,com.zubahouse.customer:/oauthredirect'),
  expoOwner: normalize(process.env.EXPO_OWNER) || 'olivierndev',
  expoSlug: normalize(process.env.EXPO_SLUG) || 'zuba-mobile',
  /** Optional — expo.dev account access token for higher push throughput in production */
  expoAccessToken: normalize(process.env.EXPO_ACCESS_TOKEN),

  stripeSecretKey: normalize(process.env.STRIPE_SECRET_KEY),
  stripeTargetAccount: normalize(process.env.STRIPE_TARGET_ACCOUNT || process.env.STRIPE_ACCOUNT),
  stripeCurrency: normalize(process.env.STRIPE_CURRENCY || process.env.CURRENCY) || 'USD',
  stripeWebhookSecret: normalize(process.env.STRIPE_WEBHOOK_SECRET),

  paypalMode: normalize(process.env.PAYPAL_MODE) || 'test',
  paypalClientIdLive: normalize(process.env.PAYPAL_CLIENT_ID_LIVE),
  paypalSecretLive: normalize(process.env.PAYPAL_SECRET_LIVE),

  easypostApiKey: normalize(process.env.EASYPOST_API_KEY),

  warehouseName: normalize(process.env.WAREHOUSE_NAME),
  warehouseAddress1: normalize(process.env.WAREHOUSE_ADDRESS1),
  warehouseCity: normalize(process.env.WAREHOUSE_CITY),
  warehouseProvince: normalize(process.env.WAREHOUSE_PROVINCE),
  warehousePostal: normalize(process.env.WAREHOUSE_POSTAL),
  warehouseCountry: normalize(process.env.WAREHOUSE_COUNTRY),
  warehousePhone: normalize(process.env.WAREHOUSE_PHONE),

  fallbackBaseRate: parseNumber(process.env.FALLBACK_BASE_RATE, 13),
  fallbackExtraItem: parseNumber(process.env.FALLBACK_EXTRA_ITEM, 3),

  logoUrl: normalize(process.env.ZUBA_LOGO_URL || process.env.LOGO_URL),
  adminEmail: normalize(process.env.ADMIN_EMAIL),
};

export const allKnownEnvKeys = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'MONGODB_LOCAL_URI',
  'MONGODB_URL',
  'MONGO_URI',
  'SECRET_KEY_ACCESS_TOKEN',
  'SECRET_KEY_REFRESH_TOKEN',
  'JSON_WEB_TOKEN_SECRET_KEY',
  'JWT_SECRET_KEY',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'OTP_EXPIRY_MINUTES',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'EMAIL_SENDER_NAME',
  'EMAIL',
  'EMAIL_USER',
  'TEST_EMAIL',
  'cloudinary_Config_Cloud_Name',
  'cloudinary_Config_api_key',
  'cloudinary_Config_api_secret',
  'FRONTEND_URL',
  'ADMIN_URL',
  'VENDOR_URL',
  'CLIENT_URL',
  'API_URL',
  'BACKEND_URL',
  'COOKIE_DOMAIN',
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'GOOGLE_VISION_API_KEY',
  'GOOGLE_CLOUD_VISION_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_IOS_CLIENT_ID',
  'GOOGLE_ANDROID_CLIENT_ID',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'GOOGLE_OAUTH_REDIRECT_URIS',
  'EXPO_OWNER',
  'EXPO_SLUG',
  'STRIPE_SECRET_KEY',
  'STRIPE_TARGET_ACCOUNT',
  'STRIPE_ACCOUNT',
  'STRIPE_WEBHOOK_SECRET',
  'CURRENCY',
  'STRIPE_CURRENCY',
  'PAYPAL_MODE',
  'PAYPAL_CLIENT_ID_LIVE',
  'PAYPAL_SECRET_LIVE',
  'EASYPOST_API_KEY',
  'FALLBACK_BASE_RATE',
  'FALLBACK_EXTRA_ITEM',
  'WAREHOUSE_NAME',
  'WAREHOUSE_ADDRESS1',
  'WAREHOUSE_CITY',
  'WAREHOUSE_PROVINCE',
  'WAREHOUSE_POSTAL',
  'WAREHOUSE_COUNTRY',
  'WAREHOUSE_PHONE',
  'ZUBA_LOGO_URL',
  'LOGO_URL',
  'ADMIN_EMAIL',
];

