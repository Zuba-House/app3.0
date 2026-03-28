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
 * 3. Add authorized redirect URI: https://auth.expo.io/@YOUR_EXPO_USERNAME/zuba-mobile
 *    (YOUR_EXPO_USERNAME = app.json "owner" or EXPO_PUBLIC_EXPO_OWNER)
 * 4. Set expoClientId in app.json extra (same Web client ID)
 * 5. Server: GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (same Web client; secret never in the app)
 */

import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Complete the auth session when done
WebBrowser.maybeCompleteAuthSession();

/** Parse ?code= / ?error= from OAuth redirect (Hermes-safe; avoids URL() edge cases). */
function parseOAuthCallbackUrl(callbackUrl: string): {
  code?: string;
  error?: string;
  errorDescription?: string;
} {
  try {
    const q = callbackUrl.indexOf('?');
    const h = callbackUrl.indexOf('#');
    let query = '';
    if (q >= 0) {
      const end = h > q ? h : callbackUrl.length;
      query = callbackUrl.slice(q + 1, end);
    } else if (h >= 0) {
      query = callbackUrl.slice(h + 1);
    }
    const params = new URLSearchParams(query);
    const rawDesc = params.get('error_description');
    let errorDescription: string | undefined;
    if (rawDesc) {
      try {
        errorDescription = decodeURIComponent(rawDesc.replace(/\+/g, ' '));
      } catch {
        errorDescription = rawDesc;
      }
    }
    return {
      code: params.get('code') || undefined,
      error: params.get('error') || undefined,
      errorDescription,
    };
  } catch {
    return {};
  }
}

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
 * Get redirect URI for Expo Go (must match Google Cloud "Authorized redirect URIs" exactly).
 * Set `owner` in app.json (EAS) or EXPO_PUBLIC_EXPO_OWNER in .env — must be your Expo account username.
 */
const getRedirectUri = (): string => {
  const owner =
    Constants.expoConfig?.owner ||
    (typeof process.env.EXPO_PUBLIC_EXPO_OWNER === 'string'
      ? process.env.EXPO_PUBLIC_EXPO_OWNER.trim()
      : '') ||
    'olivierndev';
  const slug = Constants.expoConfig?.slug || 'zuba-mobile';
  return `https://auth.expo.io/@${owner}/${slug}`;
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
      `client_id=${encodeURIComponent(expoClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid profile email')}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    // Open auth session
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const { code, error, errorDescription } = parseOAuthCallbackUrl(result.url);

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
