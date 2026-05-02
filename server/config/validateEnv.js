import { env } from './env.js';

export function validateEnv() {
    const missing = [];
    const warnings = [];

    // Core required startup variables
    if (!env.port) missing.push('PORT');
    if (!env.jwtAccessSecret) missing.push('SECRET_KEY_ACCESS_TOKEN');
    if (!env.jwtRefreshSecret) missing.push('SECRET_KEY_REFRESH_TOKEN');
    if (!env.jwtLegacySecret) missing.push('JSON_WEB_TOKEN_SECRET_KEY');
    if (!env.sendgridApiKey) missing.push('SENDGRID_API_KEY');
    if (!env.emailFrom) missing.push('EMAIL_FROM (or EMAIL/EMAIL_USER)');
    if (!env.cloudinaryCloudName) missing.push('cloudinary_Config_Cloud_Name');
    if (!env.cloudinaryApiKey) missing.push('cloudinary_Config_api_key');
    if (!env.cloudinaryApiSecret) missing.push('cloudinary_Config_api_secret');

    // Database
    if (!env.mongodbUri && !env.mongodbLocalUri) {
        missing.push('MONGODB_URI or MONGODB_LOCAL_URI');
    }

    // Stripe warnings
    if (env.stripeSecretKey) {
        if (env.stripeSecretKey.includes('placeholder')) {
            warnings.push('STRIPE_SECRET_KEY appears to be a placeholder');
        }
        if (env.stripeSecretKey.startsWith('sk_org_') && !env.stripeTargetAccount) {
                warnings.push('STRIPE_TARGET_ACCOUNT or STRIPE_ACCOUNT required when using organization key');
        }
    }

    // Feature-level warnings (not startup-blocking)
    if (!env.googleClientId || !env.googleClientSecret) {
        warnings.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for Google login');
    }
    if (!env.easypostApiKey) {
        warnings.push('EASYPOST_API_KEY not set. Shipping label/rate integrations may fail');
    }
    if (!env.googleMapsApiKey) {
        warnings.push('GOOGLE_MAPS_API_KEY not set. Address autocomplete falls back to limited mode');
    }

    // PayPal warnings
    if (env.paypalMode === 'live') {
        if (!env.paypalClientIdLive || !env.paypalSecretLive) {
            warnings.push('PAYPAL_CLIENT_ID_LIVE and PAYPAL_SECRET_LIVE required when PAYPAL_MODE=live');
        }
    }

    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Please create a .env file based on .env.example');
        console.error('💡 See README.md for setup instructions\n');
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  Environment variable warnings:');
        warnings.forEach(warning => {
            console.warn(`   - ${warning}`);
        });
        console.warn('');
    }

    console.log('✅ Environment variables validated successfully\n');
}


