import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { GOOGLE_AUTH_CONFIG, getGoogleClientIdForPlatform, getGoogleConfigIssues } from '../../../constants/config';
import { socialAuthService } from '../../../core/auth/socialAuth.service';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_SCOPES = ['openid', 'profile', 'email'];
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';

function safePreview(value: string | null | undefined): string {
  if (!value) return 'missing';
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function sanitizeOAuthUrl(url: string | null | undefined): Record<string, string> | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const param = (key: string) => parsed.searchParams.get(key) || '';
    return {
      origin: parsed.origin,
      pathname: parsed.pathname,
      client_id: param('client_id'),
      redirect_uri: decodeURIComponent(param('redirect_uri') || ''),
      response_type: param('response_type'),
      scope: decodeURIComponent(param('scope') || ''),
      access_type: param('access_type'),
      state: safePreview(param('state')),
      code_challenge_method: param('code_challenge_method'),
      code_challenge: safePreview(param('code_challenge')),
    };
  } catch {
    return null;
  }
}

function buildGoogleRedirectUri(): string {
  if (isWeb) {
    return AuthSession.makeRedirectUri({
      path: GOOGLE_AUTH_CONFIG.redirectPath,
      preferLocalhost: true,
    });
  }
  if (Platform.OS === 'ios' && GOOGLE_AUTH_CONFIG.iosClientId) {
    return `${toReversedGoogleScheme(GOOGLE_AUTH_CONFIG.iosClientId)}:/oauthredirect`;
  }
  if (Platform.OS === 'android' && GOOGLE_AUTH_CONFIG.androidClientId) {
    return AuthSession.makeRedirectUri({
      scheme: 'zuba',
      path: GOOGLE_AUTH_CONFIG.redirectPath,
      native: 'com.zubahouse.customer:/oauthredirect',
    });
  }
  if (GOOGLE_AUTH_CONFIG.redirectUri) {
    return GOOGLE_AUTH_CONFIG.redirectUri;
  }
  return AuthSession.makeRedirectUri({
    scheme: 'zuba',
    path: GOOGLE_AUTH_CONFIG.redirectPath,
    preferLocalhost: false,
    native: 'com.zubahouse.customer:/oauthredirect',
  });
}

function toReversedGoogleScheme(clientId: string): string {
  const prefix = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${prefix}`;
}

export function useGoogleAuth() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectUri = useMemo(() => buildGoogleRedirectUri(), []);
  const selectedClientId = useMemo(() => getGoogleClientIdForPlatform(), []);

  const configIssues = useMemo(() => {
    const issues = getGoogleConfigIssues();
    if (isExpoGo) {
      issues.push('Google sign-in should be tested in a development build, not Expo Go.');
    }
    return issues;
  }, []);

  const [request, , promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId || undefined,
    androidClientId: GOOGLE_AUTH_CONFIG.androidClientId || undefined,
    webClientId: GOOGLE_AUTH_CONFIG.webClientId || undefined,
    clientId: selectedClientId || undefined,
    responseType: AuthSession.ResponseType.Code,
    scopes: GOOGLE_SCOPES,
    redirectUri,
    shouldAutoExchangeCode: false,
  });

  const debugSnapshot = useMemo(() => {
    const authUrlParams = sanitizeOAuthUrl(request?.url || null);
    return {
      platform: Platform.OS,
      isExpoGo,
      selectedClientId: selectedClientId || 'missing',
      selectedClientIdPreview: safePreview(selectedClientId || ''),
      webClientIdPreview: safePreview(GOOGLE_AUTH_CONFIG.webClientId),
      iosClientIdPreview: safePreview(GOOGLE_AUTH_CONFIG.iosClientId),
      androidClientIdPreview: safePreview(GOOGLE_AUTH_CONFIG.androidClientId),
      configuredRedirectUri: GOOGLE_AUTH_CONFIG.redirectUri || 'missing',
      runtimeRedirectUri: request?.redirectUri || redirectUri,
      redirectPath: GOOGLE_AUTH_CONFIG.redirectPath,
      requestUrl: request?.url || null,
      authUrlParams,
    };
  }, [redirectUri, request?.redirectUri, request?.url, selectedClientId]);

  const signInWithGoogle = async (): Promise<boolean> => {
    setError(null);
    console.info('[GoogleOAuth][runtime]', debugSnapshot);
    if (configIssues.length > 0) {
      setError(configIssues[0]);
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
      console.info('[GoogleOAuth][result]', {
        type: result.type,
        error: result.type === 'error' ? result.params?.error : undefined,
        error_description: result.type === 'error' ? result.params?.error_description : undefined,
        hasCode: Boolean(result.params?.code),
        paramsKeys: result.params ? Object.keys(result.params) : [],
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setError('Google sign-in was closed before completion.');
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

      console.info('[GoogleOAuth][exchange:request]', {
        provider: 'google',
        redirectUriForExchange: request.redirectUri || redirectUri,
        selectedClientId,
        authorizationCodePreview: safePreview(result.params.code),
        codeVerifierPreview: safePreview(codeVerifier),
      });

      await socialAuthService.authenticate({
        provider: 'google',
        authorizationCode: result.params.code,
        codeVerifier,
        redirectUri: request.redirectUri || redirectUri,
        clientId: selectedClientId,
      });
      console.info('[GoogleOAuth][exchange:success]', { provider: 'google' });

      return true;
    } catch (err) {
      console.error('[GoogleOAuth][exchange:error]', {
        message: err instanceof Error ? err.message : String(err),
      });
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
    googleAuthDiagnostics: debugSnapshot,
    platform: Platform.OS,
    googleConfigIssues: configIssues,
  };
}
