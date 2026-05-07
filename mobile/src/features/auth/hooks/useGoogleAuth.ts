import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_AUTH_CONFIG, getGoogleClientIdForPlatform, getGoogleConfigIssues } from '../../../constants/config';
import { socialAuthService } from '../../../core/auth/socialAuth.service';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_SCOPES = ['openid', 'profile', 'email'];

export function useGoogleAuth() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectUri = useMemo(
    () =>
      GOOGLE_AUTH_CONFIG.redirectUri ||
      AuthSession.makeRedirectUri({
        scheme: 'zuba',
        path: GOOGLE_AUTH_CONFIG.redirectPath,
        preferLocalhost: false,
      }),
    []
  );

  const configIssues = useMemo(() => getGoogleConfigIssues(), []);

  const [request, , promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId || undefined,
    androidClientId: GOOGLE_AUTH_CONFIG.androidClientId || undefined,
    webClientId: GOOGLE_AUTH_CONFIG.webClientId || undefined,
    clientId: getGoogleClientIdForPlatform() || undefined,
    responseType: AuthSession.ResponseType.Code,
    scopes: GOOGLE_SCOPES,
    redirectUri,
    shouldAutoExchangeCode: false,
  });

  const signInWithGoogle = async (): Promise<boolean> => {
    setError(null);
    if (configIssues.length > 0) {
      setError('Google Sign-In is currently unavailable due to app configuration. Please update Google OAuth client settings.');
      return false;
    }
    const network = await NetInfo.fetch();
    if (!network.isConnected) {
      setError('You appear to be offline. Please reconnect and try again.');
      return false;
    }
    if (!request) {
      setError('Google sign-in is not ready yet. Please try again.');
      return false;
    }

    setSubmitting(true);
    try {
      const result = await promptAsync({
        showInRecents: true,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setError('Google sign-in was cancelled.');
        return false;
      }

      if (result.type === 'error') {
        const oauthError = result.params?.error || '';
        if (oauthError === 'invalid_request') {
          setError('Google OAuth configuration is invalid. Please contact support.');
        } else {
          setError(result.params?.error_description || 'Google sign-in failed.');
        }
        return false;
      }

      if (result.type !== 'success' || !result.params?.code) {
        setError('Unable to complete Google sign-in. Please try again.');
        return false;
      }

      const codeVerifier = request.codeVerifier;
      if (!codeVerifier) {
        setError('Google sign-in failed due to invalid PKCE verifier.');
        return false;
      }

      await socialAuthService.authenticate({
        provider: 'google',
        authorizationCode: result.params.code,
        codeVerifier,
        redirectUri: request.redirectUri || redirectUri,
        clientId: getGoogleClientIdForPlatform(),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    signInWithGoogle,
    googleLoading: submitting,
    googleError: error,
    googleReady: Boolean(request),
    googleRequestUrl: request?.url || null,
    platform: Platform.OS,
    googleConfigIssues: configIssues,
  };
}
