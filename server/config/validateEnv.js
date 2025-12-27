/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
    'PORT',
    'SECRET_KEY_ACCESS_TOKEN',
    'SECRET_KEY_REFRESH_TOKEN',
    'JSON_WEB_TOKEN_SECRET_KEY',
    'cloudinary_Config_Cloud_Name',
    'cloudinary_Config_api_key',
    'cloudinary_Config_api_secret',
    'EMAIL',
    'EMAIL_PASS',
];

const optionalEnvVars = [
    'MONGODB_URI',
    'MONGODB_LOCAL_URI',
    'STRIPE_SECRET_KEY',
    'STRIPE_TARGET_ACCOUNT',
    'STRIPE_ACCOUNT',
    'CURRENCY',
    'STRIPE_CURRENCY',
    'PAYPAL_MODE',
    'PAYPAL_CLIENT_ID_TEST',
    'PAYPAL_SECRET_TEST',
    'PAYPAL_CLIENT_ID_LIVE',
    'PAYPAL_SECRET_LIVE',
];

export function validateEnv() {
    const missing = [];
    const warnings = [];

    // Check required variables
    for (const varName of requiredEnvVars) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    // Check MongoDB connection (at least one is required)
    if (!process.env.MONGODB_URI && !process.env.MONGODB_LOCAL_URI) {
        missing.push('MONGODB_URI or MONGODB_LOCAL_URI');
    }

    // Check Stripe configuration if using Stripe
    if (process.env.STRIPE_SECRET_KEY) {
        if (process.env.STRIPE_SECRET_KEY.startsWith('sk_org_')) {
            if (!process.env.STRIPE_TARGET_ACCOUNT && !process.env.STRIPE_ACCOUNT) {
                warnings.push('STRIPE_TARGET_ACCOUNT or STRIPE_ACCOUNT required when using organization key');
            }
        }
    }

    // Check PayPal configuration if using PayPal
    if (process.env.PAYPAL_MODE === 'live') {
        if (!process.env.PAYPAL_CLIENT_ID_LIVE || !process.env.PAYPAL_SECRET_LIVE) {
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


