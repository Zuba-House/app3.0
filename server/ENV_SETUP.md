# Environment Variables Setup Guide

This document lists all required and optional environment variables for the server.

## Quick Start

1. Copy the template below to create a `.env` file in the `server/` directory
2. Fill in your actual values
3. Never commit the `.env` file to version control

## Environment Variables Template

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Use either MONGODB_URI (Atlas) or MONGODB_LOCAL_URI (local), or both
# At least one is REQUIRED
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_LOCAL_URI=mongodb://localhost:27017/zuba

# ============================================
# JWT SECRETS (REQUIRED)
# ============================================
# Generate strong random strings for these
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret_key_here
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret_key_here
JSON_WEB_TOKEN_SECRET_KEY=your_jwt_secret_key_here

# ============================================
# CLOUDINARY CONFIGURATION (REQUIRED)
# ============================================
# For image uploads and media storage
# Get these from: https://cloudinary.com/console
cloudinary_Config_Cloud_Name=your_cloudinary_cloud_name
cloudinary_Config_api_key=your_cloudinary_api_key
cloudinary_Config_api_secret=your_cloudinary_api_secret

# ============================================
# EMAIL CONFIGURATION (REQUIRED)
# ============================================
# For sending emails (password reset, verification, order confirmations, etc.)
# Hostinger SMTP Configuration
EMAIL=orders@zubahouse.com
EMAIL_PASS=your_email_password
EMAIL_SENDER_NAME=Zuba House

# Hostinger SMTP Settings
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true

# Optional: Test email recipient (for /test-email endpoint)
TEST_EMAIL=olivier.niyo250@gmail.com

# ============================================
# STRIPE PAYMENT CONFIGURATION (OPTIONAL)
# ============================================
# Only required if using Stripe for payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_TARGET_ACCOUNT=acct_your_stripe_account_id
STRIPE_ACCOUNT=acct_your_stripe_account_id
CURRENCY=USD
STRIPE_CURRENCY=USD

# ============================================
# PAYPAL PAYMENT CONFIGURATION (OPTIONAL)
# ============================================
# Only required if using PayPal for payments
PAYPAL_MODE=test
PAYPAL_CLIENT_ID_TEST=your_paypal_test_client_id
PAYPAL_SECRET_TEST=your_paypal_test_secret
PAYPAL_CLIENT_ID_LIVE=your_paypal_live_client_id
PAYPAL_SECRET_LIVE=your_paypal_live_secret

# ============================================
# CORS CONFIGURATION (OPTIONAL)
# ============================================
# Comma-separated list of allowed origins
# If not set, defaults to localhost ports for development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# ============================================
# NODE ENVIRONMENT (OPTIONAL)
# ============================================
# Set to 'production' for production environment
NODE_ENV=development
```

## Required Variables

The following environment variables are **REQUIRED** for the server to start:

- `PORT` - Server port number
- `SECRET_KEY_ACCESS_TOKEN` - JWT secret for access tokens
- `SECRET_KEY_REFRESH_TOKEN` - JWT secret for refresh tokens
- `JSON_WEB_TOKEN_SECRET_KEY` - JWT secret key
- `cloudinary_Config_Cloud_Name` - Cloudinary cloud name
- `cloudinary_Config_api_key` - Cloudinary API key
- `cloudinary_Config_api_secret` - Cloudinary API secret
- `EMAIL` - Email address for sending emails
- `EMAIL_PASS` - Email password/app password
- `MONGODB_URI` or `MONGODB_LOCAL_URI` - At least one MongoDB connection string is required

## Optional Variables

These variables are optional but may be required depending on your setup:

- **Stripe**: Required if using Stripe for payments
- **PayPal**: Required if using PayPal for payments
- **ALLOWED_ORIGINS**: Custom CORS origins (defaults to localhost ports)
- **NODE_ENV**: Environment mode (development/production)

## Security Notes

1. **Never commit `.env` files** to version control
2. Use **strong, randomly generated secrets** for JWT keys
3. In production, use **environment-specific values**
4. Rotate secrets regularly
5. Use **App Passwords** for Gmail (not your regular password)

## Generating Secure Secrets

You can generate secure random strings using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this three times to generate secrets for:
- `SECRET_KEY_ACCESS_TOKEN`
- `SECRET_KEY_REFRESH_TOKEN`
- `JSON_WEB_TOKEN_SECRET_KEY`

## Validation

The server will validate all required environment variables at startup. If any are missing, the server will:
1. Display which variables are missing
2. Exit with an error code
3. Provide helpful error messages

## Troubleshooting

### "Missing required environment variables" error
- Check that your `.env` file exists in the `server/` directory
- Verify all required variables are set
- Check for typos in variable names

### MongoDB connection issues
- Ensure at least one MongoDB URI is set
- Verify the connection string is correct
- Check network access for MongoDB Atlas

### Email sending fails
- Verify email credentials are correct
- For Gmail, ensure you're using an App Password
- Check that less secure apps are enabled (if not using App Password)


