# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the Zuba House mobile app.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: **Zuba House**
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

## Step 2: Create OAuth 2.0 Client ID

1. Application type: **Web application**
2. Name: **Zuba House Mobile** (or any name you prefer)
3. Authorized redirect URIs:
   - For **Development (Expo Go)**: `exp://localhost:8081`
   - For **Production**: `zuba://auth/callback`
   - Add both if you want to test in both environments
4. Click **Create**
5. **Copy the Client ID** (you'll need this)

## Step 3: Configure the App

### Option A: Using Environment Variable (Recommended)

1. Create a `.env` file in the `mobile` directory:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

2. Install `dotenv` if needed:
   ```bash
   npm install dotenv
   ```

### Option B: Using app.json (Alternative)

1. Open `mobile/app.json`
2. Find the `extra` section
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```json
   "extra": {
     "apiUrl": "https://zuba-api.onrender.com",
     "eas": {
       "projectId": "zuba-house-019"
     },
     "googleClientId": "your-client-id-here.apps.googleusercontent.com"
   }
   ```

### Option C: Hardcode (Not Recommended for Production)

You can temporarily hardcode the Client ID in `mobile/src/utils/googleAuth.ts`:
```typescript
const getGoogleClientId = (): string | null => {
  return 'your-client-id-here.apps.googleusercontent.com';
};
```

## Step 4: Test Google Authentication

1. Start your Expo app:
   ```bash
   cd mobile
   npx expo start
   ```

2. Navigate to the Login screen
3. Click **Continue with Google**
4. You should see the Google sign-in page
5. After signing in, you should be redirected back to the app

## Troubleshooting

### Error: "Google OAuth not configured"

- Make sure you've set the `EXPO_PUBLIC_GOOGLE_CLIENT_ID` environment variable or updated `app.json`
- Restart the Expo development server after making changes

### Error: "redirect_uri_mismatch"

- Make sure you've added the correct redirect URI in Google Cloud Console
- For Expo Go: `exp://localhost:8081`
- For production: `zuba://auth/callback`
- Make sure there are no trailing slashes

### Error: "invalid_client"

- Double-check your Client ID is correct
- Make sure you're using the Web application Client ID, not iOS/Android

### App doesn't redirect back after Google login

- Make sure the scheme in `app.json` matches your redirect URI
- For development, you might need to use `exp://` scheme
- Check that `expo-linking` is properly installed

## Security Notes

- **Never commit your Client ID to public repositories**
- Use environment variables for sensitive configuration
- The Client ID is safe to expose in client-side code (it's public)
- The Client Secret should NEVER be in the mobile app (only on backend)

## Backend Configuration

The backend endpoint `/api/user/authWithGoogle` is already configured and expects:
- `name`: User's name
- `email`: User's email
- `avatar`: (optional) User's profile picture URL
- `mobile`: (optional) User's phone number

The backend will:
1. Check if user exists (by email)
2. Create new user if doesn't exist
3. Return access token and refresh token

## Next Steps

Once Google authentication is working:
1. Test the full flow (login → app navigation)
2. Test with different Google accounts
3. Verify user data is saved correctly in the backend
4. Test logout functionality

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all redirect URIs are correctly configured
3. Make sure the OAuth consent screen is published (for production)
4. Check that the Google OAuth API is enabled in your GCP project
