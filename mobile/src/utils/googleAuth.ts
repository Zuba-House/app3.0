/**
 * Google OAuth Helper
 * Works with Expo Go - No native modules required
 * 
 * This implementation uses expo-web-browser which works perfectly in Expo Go
 * without requiring native crypto modules.
 * 
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create OAuth 2.0 Client ID (Web application)
 * 3. Add authorized redirect URI: https://auth.expo.io/@olivierndev/zuba-mobile
 * 4. Set expoClientId in app.json extra section
 */

import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Complete the auth session when done
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  success: boolean;
  /** When using backend code exchange, only code + redirectUri are set */
  code?: string;
  redirectUri?: string;
  email?: string;
  name?: string;
  avatar?: string;
  mobile?: string;
  error?: string;
}

/**
 * Get Google OAuth Client ID from app.json
 */
const getExpoClientId = (): string | null => {
  try {
    let clientId = Constants.expoConfig?.extra?.expoClientId;
    
    // Fallback to googleClientId for backward compatibility
    if (!clientId) {
      clientId = Constants.expoConfig?.extra?.googleClientId;
    }
    
    // Try environment variable as last resort
    if (!clientId && process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
      clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID.trim();
    }
    
    if (clientId && 
        typeof clientId === 'string' &&
        clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && 
        clientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
        clientId.trim().length > 10) {
      return clientId.trim();
    }
  } catch (error) {
    console.log('Could not read client ID from config:', error);
  }
  
  return null;
};

/**
 * Get redirect URI for Expo Go
 */
const getRedirectUri = (): string => {
  // For Expo Go, use the Expo auth proxy
  const username = 'olivierndev';
  const slug = Constants.expoConfig?.slug || 'zuba-mobile';
  return `https://auth.expo.io/@${username}/${slug}`;
};

/**
 * Google OAuth flow using WebBrowser (works in Expo Go)
 * This approach doesn't require native crypto modules
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    const expoClientId = getExpoClientId();
    
    if (!expoClientId) {
      return {
        success: false,
        error: 'Google OAuth not configured. Please set expoClientId in app.json extra section.',
      };
    }

    // Logging disabled for production - uncomment for debugging
    // console.log('🔐 Starting Google OAuth flow...');
    // console.log('Using Client ID:', expoClientId.substring(0, 20) + '...');

    const redirectUri = getRedirectUri();
    // Logging disabled for production - uncomment for debugging
    // console.log('🔐 Redirect URI:', redirectUri);

    // Build Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${expoClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open auth session
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

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

      if (!code) {
        return {
          success: false,
          error: 'No authorization code received from Google',
        };
      }

      // Return code to app; backend will exchange with client_secret and return app tokens.
      return {
        success: true,
        code,
        redirectUri,
      };
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

// Default export for compatibility
export default signInWithGoogle;
