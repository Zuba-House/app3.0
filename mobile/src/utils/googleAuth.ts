/**
 * Google OAuth Helper
 * Simplified Google authentication using WebBrowser
 * 
 * Note: For production, you should:
 * 1. Set up Google OAuth credentials in Google Cloud Console
 * 2. Configure redirect URIs
 * 3. Exchange authorization code on backend (more secure)
 */

import * as WebBrowser from 'expo-web-browser';

// Complete the auth session when done
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  success: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  error?: string;
}

/**
 * Simple Google OAuth flow
 * Opens Google login in browser and returns user info
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    // TODO: Replace with your actual Google OAuth credentials
    // Get these from: https://console.cloud.google.com/apis/credentials
    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
    const REDIRECT_URI = 'zuba://auth/callback'; // Your app's deep link
    
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      return {
        success: false,
        error: 'Google OAuth not configured. Please contact support or use email/password login.',
      };
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=profile email&` +
      `access_type=offline&` +
      `prompt=consent`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return {
          success: false,
          error: `Google login error: ${error}`,
        };
      }

      if (code) {
        // In production, send this code to your backend to exchange for tokens
        // For now, return the code (backend will handle the exchange)
        return {
          success: true,
          // Backend will handle the code exchange and return user info
        };
      }
    }

    return {
      success: false,
      error: 'Google login was cancelled',
    };
  } catch (error: any) {
    console.error('Google auth error:', error);
    return {
      success: false,
      error: error.message || 'Google login failed',
    };
  }
};
