/**
 * Google OAuth Helper
 * Google authentication using WebBrowser and Google OAuth
 * 
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create OAuth 2.0 Client ID (Web application)
 * 3. Add authorized redirect URIs:
 *    - For development: exp://localhost:8081
 *    - For production: your-app-scheme://auth/callback
 * 4. Copy the Client ID and set it in app.json or environment variable
 */

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Complete the auth session when done
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  success: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  mobile?: string;
  error?: string;
}

/**
 * Get Google OAuth Client ID from environment or config
 * You can set this in app.json extra section or as environment variable
 * 
 * Setup: See GOOGLE_AUTH_SETUP.md for detailed instructions
 */
const getGoogleClientId = (): string | null => {
  // Try environment variable first (recommended)
  if (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID.trim();
    if (clientId && 
        clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && 
        clientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
        clientId.length > 10) {
      return clientId;
    }
  }
  
  // Try reading from app.json extra section
  try {
    const clientId = Constants.expoConfig?.extra?.googleClientId;
    if (clientId && 
        typeof clientId === 'string' &&
        clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && 
        clientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
        clientId.trim().length > 10) {
      return clientId.trim();
    }
  } catch (error) {
    console.log('Could not read from app.json:', error);
  }
  
  // Not configured
  return null;
};

/**
 * Get redirect URI for OAuth callback
 * For Expo Go, we need to use the Expo auth redirect URI
 */
const getRedirectUri = (): string => {
  // Get Expo username and slug from config
  const username = 'olivierndev'; // Your Expo username
  const slug = Constants.expoConfig?.slug || 'zuba-mobile';
  
  // For Expo Go development, use Expo's auth redirect URI
  // Format: https://auth.expo.io/@username/slug
  return `https://auth.expo.io/@${username}/${slug}`;
};

/**
 * Google OAuth flow
 * Opens Google login and returns user info
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    const GOOGLE_CLIENT_ID = getGoogleClientId();
    
    if (!GOOGLE_CLIENT_ID) {
      return {
        success: false,
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID in app.json or environment variables.',
      };
    }

    const REDIRECT_URI = getRedirectUri();
    
    // Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log('🔐 Starting Google OAuth flow...');
    console.log('Redirect URI:', REDIRECT_URI);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error) {
        return {
          success: false,
          error: errorDescription || `Google login error: ${error}`,
        };
      }

      if (code) {
        // NOTE: To exchange the authorization code for user info, we need the client secret
        // which should NOT be in the mobile app. The proper solution is to send the code
        // to your backend and have the backend exchange it.
        
        // For now, we'll try to get user info using the code
        // In production, modify your backend to accept the code and return user info
        
        try {
          // Try to exchange code for token (this will fail without client_secret)
          // In production, send code to backend instead
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code,
              client_id: GOOGLE_CLIENT_ID,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code',
              // client_secret is required but should NOT be in mobile app
              // This will fail - backend should handle this instead
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            // If we get an error about missing client_secret, provide helpful message
            if (errorData.error === 'invalid_client' || errorData.error_description?.includes('client_secret')) {
              return {
                success: false,
                error: 'Google OAuth requires backend configuration. Please contact support to enable Google login, or use email/password login.',
              };
            }
            throw new Error(errorData.error_description || 'Failed to exchange code for token');
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          if (!accessToken) {
            throw new Error('No access token received from Google');
          }

          // Get user info from Google
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info from Google');
          }

          const userInfo = await userInfoResponse.json();

          return {
            success: true,
            email: userInfo.email,
            name: userInfo.name || userInfo.given_name || '',
            avatar: userInfo.picture,
            mobile: userInfo.phone_number || undefined,
          };
        } catch (exchangeError: any) {
          console.error('Error exchanging code for user info:', exchangeError);
          
          // Provide helpful error message
          if (exchangeError.message?.includes('client_secret') || 
              exchangeError.message?.includes('backend configuration')) {
            return {
              success: false,
              error: 'Google OAuth requires backend configuration. Please contact support or use email/password login.',
            };
          }
          
          return {
            success: false,
            error: exchangeError.message || 'Failed to complete Google login. Please try again or use email/password.',
          };
        }
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return {
        success: false,
        error: 'Google login was cancelled',
      };
    }

    return {
      success: false,
      error: 'Google login failed. Please try again.',
    };
  } catch (error: any) {
    console.error('Google auth error:', error);
    return {
      success: false,
      error: error.message || 'Google login failed',
    };
  }
};
