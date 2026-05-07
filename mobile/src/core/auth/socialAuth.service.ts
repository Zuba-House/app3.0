import { authFeatureApi } from '../../features/auth/auth.api';
import { authManager } from './authManager';

export type SupportedProvider = 'google' | 'apple' | 'facebook' | 'phone';

export interface SocialAuthRequest {
  provider: SupportedProvider;
  authorizationCode?: string;
  idToken?: string;
  accessToken?: string;
  codeVerifier?: string;
  redirectUri?: string;
  clientId?: string;
  phoneNumber?: string;
  otpCode?: string;
}

export interface SocialAuthAdapter {
  provider: SupportedProvider;
  exchange(request: SocialAuthRequest): Promise<{ accessToken: string; refreshToken?: string }>;
}

class SocialAuthError extends Error {
  constructor(message: string, readonly provider: SupportedProvider) {
    super(message);
    this.name = 'SocialAuthError';
  }
}

const adapters: Record<SupportedProvider, SocialAuthAdapter> = {
  google: {
    provider: 'google',
    async exchange(request) {
      if (!request.authorizationCode || !request.codeVerifier || !request.redirectUri) {
        throw new SocialAuthError('Google credentials missing', 'google');
      }
      const payload = await authFeatureApi.exchangeSocialToken('google', {
        code: request.authorizationCode,
        code_verifier: request.codeVerifier,
        redirect_uri: request.redirectUri,
        google_client_id: request.clientId || '',
      });
      if (!payload.success) throw new SocialAuthError(payload.message || 'Google exchange failed', 'google');
      const accessToken = (payload.data as any)?.accessToken;
      const refreshToken = (payload.data as any)?.refreshToken;
      if (!accessToken) {
        throw new SocialAuthError('Google exchange did not return a valid session', 'google');
      }
      return { accessToken, refreshToken };
    },
  },
  apple: {
    provider: 'apple',
    async exchange(request) {
      if (!request.authorizationCode && !request.idToken) {
        throw new SocialAuthError('Apple credentials missing', 'apple');
      }
      const payload = await authFeatureApi.exchangeSocialToken('apple', {
        code: request.authorizationCode || '',
        idToken: request.idToken || '',
      });
      if (!payload.success) throw new SocialAuthError(payload.message || 'Apple exchange failed', 'apple');
      const accessToken = (payload.data as any)?.accessToken;
      const refreshToken = (payload.data as any)?.refreshToken;
      if (!accessToken) throw new SocialAuthError('Apple exchange did not return a valid session', 'apple');
      return { accessToken, refreshToken };
    },
  },
  facebook: {
    provider: 'facebook',
    async exchange(request) {
      if (!request.accessToken) {
        throw new SocialAuthError('Facebook access token missing', 'facebook');
      }
      const payload = await authFeatureApi.exchangeSocialToken('facebook', {
        accessToken: request.accessToken,
      });
      if (!payload.success) throw new SocialAuthError(payload.message || 'Facebook exchange failed', 'facebook');
      const accessToken = (payload.data as any)?.accessToken;
      const refreshToken = (payload.data as any)?.refreshToken;
      if (!accessToken) throw new SocialAuthError('Facebook exchange did not return a valid session', 'facebook');
      return { accessToken, refreshToken };
    },
  },
  phone: {
    provider: 'phone',
    async exchange(request) {
      if (!request.phoneNumber || !request.otpCode) {
        throw new SocialAuthError('Phone credentials missing', 'phone');
      }
      const payload = await authFeatureApi.exchangeSocialToken('phone', {
        phoneNumber: request.phoneNumber,
        otpCode: request.otpCode,
      });
      if (!payload.success) throw new SocialAuthError(payload.message || 'Phone exchange failed', 'phone');
      const accessToken = (payload.data as any)?.accessToken;
      const refreshToken = (payload.data as any)?.refreshToken;
      if (!accessToken) throw new SocialAuthError('Phone exchange did not return a valid session', 'phone');
      return { accessToken, refreshToken };
    },
  },
};

export const socialAuthService = {
  async authenticate(request: SocialAuthRequest): Promise<void> {
    const adapter = adapters[request.provider];
    if (!adapter) {
      throw new SocialAuthError('Unsupported provider', request.provider);
    }
    await authManager.prepareReplayProtectionContext();
    const session = await adapter.exchange(request);
    await authManager.completeExternalAuthSession(session);
  },
};
