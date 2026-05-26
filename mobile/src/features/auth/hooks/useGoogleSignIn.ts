import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { API_ENDPOINTS, API_URL } from '../../../constants/config';
import { authManager } from '../../../core/auth/authManager';
import { toUserFriendlyAuthError } from '../auth.errors';

WebBrowser.maybeCompleteAuthSession();

interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthWithGoogleResponse {
  error?: boolean;
  success?: boolean;
  message?: string;
  data?: {
    accesstoken?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export function resolveGoogleClientIds(): {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
} {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return {
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
      extra?.googleWebClientId?.trim() ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
      extra?.googleClientId?.trim(),
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || extra?.googleIosClientId?.trim(),
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || extra?.googleAndroidClientId?.trim(),
  };
}

function extractTokensFromAuthResponse(raw: AuthWithGoogleResponse): { accessToken: string; refreshToken: string } {
  const accessToken = raw?.data?.accessToken || raw?.data?.accesstoken;
  const refreshToken = raw?.data?.refreshToken || '';
  if (!accessToken) {
    throw new Error(raw?.message || 'Missing access token from server');
  }
  return { accessToken, refreshToken };
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = (await response.json()) as GoogleUserInfo & { error?: { message?: string } };
  if (!response.ok || !profile?.email) {
    throw new Error(profile?.error?.message || 'Could not load your Google profile');
  }
  return profile;
}

async function authWithGoogleOnServer(profile: GoogleUserInfo): Promise<{ accessToken: string; refreshToken: string }> {
  const body = {
    name: profile.name || profile.email?.split('@')[0] || 'User',
    email: profile.email,
    password: null,
    avatar: profile.picture || null,
    mobile: null,
    role: 'USER',
  };

  const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH_WITH_GOOGLE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const raw = (await response.json()) as AuthWithGoogleResponse;
  if (!response.ok || raw?.error === true) {
    throw new Error(raw?.message || 'Google sign-in failed');
  }
  return extractTokensFromAuthResponse(raw);
}

function maskClientId(id?: string): string | undefined {
  if (!id) return undefined;
  if (id.length <= 12) return '***';
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

/**
 * Standalone iOS/Android redirect used by expo-auth-session Google provider.
 * Must match Authorized redirect URIs on the Google OAuth client (see app.config.js CFBundleURLTypes).
 */
export function resolveGoogleOAuthRedirectUri(iosClientId?: string): string {
  if (iosClientId?.endsWith('.apps.googleusercontent.com')) {
    const clientIdPart = iosClientId.slice(0, -'.apps.googleusercontent.com'.length);
    return makeRedirectUri({
      native: `com.googleusercontent.apps.${clientIdPart}:/oauthredirect`,
    });
  }
  const bundleId = Application.applicationId || 'ninja.wpapp.appzubahousecom';
  return makeRedirectUri({
    native: `${bundleId}:/oauthredirect`,
  });
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const clientIds = resolveGoogleClientIds();
  const hasClientId = Boolean(clientIds.webClientId || clientIds.iosClientId || clientIds.androidClientId);

  useEffect(() => {
    if (!__DEV__) return;
    console.log('[GoogleAuth] env loaded:', {
      web: maskClientId(clientIds.webClientId),
      ios: maskClientId(clientIds.iosClientId),
      android: maskClientId(clientIds.androidClientId),
      redirectUri,
      configured: hasClientId,
      expoGo: Constants.appOwnership === 'expo',
    });
  }, [clientIds.androidClientId, clientIds.iosClientId, clientIds.webClientId, hasClientId, redirectUri]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const handledResponseRef = useRef<unknown>(null);

  const redirectUri = useMemo(
    () => resolveGoogleOAuthRedirectUri(clientIds.iosClientId),
    [clientIds.iosClientId]
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: clientIds.iosClientId,
    androidClientId: clientIds.androidClientId,
    webClientId: clientIds.webClientId,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const completeGoogleSignIn = useCallback(
    async (googleAccessToken: string) => {
      setSubmitting(true);
      setError(null);
      try {
        const profile = await fetchGoogleProfile(googleAccessToken);
        const session = await authWithGoogleOnServer(profile);
        await authManager.completeExternalAuthSession(session);
        onSuccess?.();
      } catch (err) {
        setError(toUserFriendlyAuthError(err, 'Google sign-in failed. Please try again.'));
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess]
  );

  useEffect(() => {
    if (!response || response === handledResponseRef.current) return;
    handledResponseRef.current = response;

    if (response.type === 'cancel' || response.type === 'dismiss') {
      return;
    }

    if (response.type === 'error') {
      const params = (response as { params?: { error?: string; error_description?: string } }).params;
      const detail = params?.error_description || params?.error;
      setError(detail?.includes('invalid_request')
        ? 'Google redirect mismatch. Use the EAS dev client (not Expo Go) and rebuild after app.json changes.'
        : 'Google sign-in failed. Please try again.');
      return;
    }

    if (response.type !== 'success') {
      return;
    }

    const googleAccessToken = response.authentication?.accessToken;
    if (!googleAccessToken) {
      setError('Google sign-in did not return an access token. Use a development build, not Expo Go.');
      return;
    }

    void completeGoogleSignIn(googleAccessToken);
  }, [response, completeGoogleSignIn]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    if (submitting) return false;
    if (Constants.appOwnership === 'expo') {
      setError('Google sign-in requires the EAS development build, not Expo Go.');
      return false;
    }
    if (!hasClientId) {
      setError('Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_*_CLIENT_ID to mobile/.env');
      return false;
    }
    if (!request) {
      setError('Google sign-in is still loading. Try again in a moment.');
      return false;
    }
    setError(null);
    try {
      if (__DEV__) {
        const authRequest = request as { clientId?: string; redirectUri?: string };
        console.log('[GoogleAuth] OAuth request:', {
          clientId: authRequest.clientId,
          redirectUri: authRequest.redirectUri,
        });
      }
      await promptAsync();
      return true;
    } catch (err) {
      setError(toUserFriendlyAuthError(err, 'Google sign-in failed. Please try again.'));
      return false;
    }
  }, [hasClientId, promptAsync, request, submitting]);

  return {
    signInWithGoogle,
    error,
    submitting,
    disabled: !hasClientId || !request || submitting,
    isConfigured: hasClientId,
  };
}
