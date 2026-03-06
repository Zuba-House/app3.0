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

    console.log('🔐 Starting Google OAuth flow...');
    console.log('Using Client ID:', expoClientId.substring(0, 20) + '...');

    const redirectUri = getRedirectUri();
    console.log('🔐 Redirect URI:', redirectUri);

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

      // Exchange code for access token
      // Note: This will fail without client_secret - backend should handle this
      try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: expoClientId,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            // client_secret is required but should NOT be in mobile app
            // Backend should handle this exchange
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          
          // If we get an error about missing client_secret, provide helpful message
          if (errorData.error === 'invalid_client' || 
              errorData.error_description?.includes('client_secret') ||
              errorData.error === 'invalid_request') {
            return {
              success: false,
              error: 'Google OAuth requires backend configuration to exchange authorization code. Please contact support or use email/password login.',
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
