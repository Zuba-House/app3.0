import { API_ENDPOINTS, API_URL } from '../../constants/config';
import { User as UserDTO } from '../../types/user.types';
import { authSession } from './authSession';
import { authStorage } from './authStorage';
import { ApiResponse, RefreshResponse } from './authTypes';
import { authRefresh } from './authRefresh';
import { authEvents, AUTH_EVENTS } from './authEvents';
import { authMonitor } from './authMonitor';
import { clearDeviceSessionMemory, getDeviceSessionId } from './authDevice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';
import { wishlistService } from '../../services/wishlist.service';

interface CredentialsInput {
  email: string;
  password: string;
}

interface RegisterInput extends CredentialsInput {
  name: string;
}

interface ExternalAuthInput {
  accessToken: string;
  refreshToken?: string;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const raw = (await response.json()) as ApiResponse<T> & { data?: any };
  if (!response.ok) {
    throw new Error(raw?.message || 'Request failed');
  }
  return raw;
}

function extractSession(data: any): RefreshResponse['session'] {
  const accessToken = data?.accessToken || data?.accesstoken;
  const refreshToken = data?.refreshToken;
  if (!accessToken) throw new Error('Missing access token');
  return {
    accessToken,
    refreshToken: refreshToken || '',
  };
}

async function applyAuthenticatedSession(session: ExternalAuthInput): Promise<void> {
  authSession.setRefreshToken(session.refreshToken || null);
  if (session.refreshToken) {
    await authStorage.setRefreshToken(session.refreshToken);
  }
  const user = await authManager.fetchCurrentUser(session.accessToken);
  authSession.setAuthenticated(user, session.accessToken);
  await authStorage.setUserCache(user);
  await mergeGuestCart(session.accessToken);
  await wishlistService.mergeLocalWishlistToCloud();
}

function isRefreshTokenInvalidError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('401') || message.includes('403') || (message.includes('refresh') && message.includes('token'));
}

let didEmitSessionExpired = false;
let isForceLoggingOut = false;

async function mergeGuestCart(accessToken: string): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CART);
  if (!raw) return;
  const items = JSON.parse(raw);
  if (!Array.isArray(items) || items.length === 0) return;
  for (const item of items) {
    const productId = item?.productId || item?.product?._id;
    const quantity = Number(item?.quantity || 1);
    if (!productId) continue;
    try {
      await fetch(`${API_URL}${API_ENDPOINTS.ADD_TO_CART}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
    } catch {
      // best effort merge
    }
  }
  await AsyncStorage.removeItem(STORAGE_KEYS.CART);
}

export const authManager = {
  subscribe: authSession.subscribe.bind(authSession),
  getState: authSession.getState.bind(authSession),
  getAccessToken: authSession.getAccessToken.bind(authSession),
  getRefreshToken: authSession.getRefreshToken.bind(authSession),

  async bootstrap(): Promise<void> {
    const startedAt = Date.now();
    authSession.setState({ isLoading: true, authStatus: 'loading' });
    const refreshToken = await authStorage.getRefreshToken();
    authSession.setRefreshToken(refreshToken);
    if (!refreshToken) {
      authSession.setGuest(true);
      authMonitor.emit('bootstrap_duration_ms', { duration: Date.now() - startedAt, restored: false });
      return;
    }
    try {
      await this.refreshSession();
      const user = await this.fetchCurrentUser();
      const accessToken = authSession.getAccessToken();
      if (!accessToken) throw new Error('Missing in-memory access token');
      authSession.setAuthenticated(user, accessToken);
      didEmitSessionExpired = false;
      authEvents.emit(AUTH_EVENTS.SESSION_RESTORED, { source: 'bootstrap' });
      authMonitor.emit('session_restored', { source: 'bootstrap' });
      authMonitor.emit('bootstrap_duration_ms', { duration: Date.now() - startedAt, restored: true });
    } catch {
      authMonitor.emit('bootstrap_duration_ms', { duration: Date.now() - startedAt, restored: false });
      await this.forceLogout('bootstrap_failed');
    }
  },

  async login(input: CredentialsInput): Promise<void> {
    authSession.setState({ isLoading: true, authStatus: 'loading' });
    try {
      const deviceSessionId = await getDeviceSessionId();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Session-Id': deviceSessionId },
        body: JSON.stringify(input),
      });
      const result = await parseResponse<any>(response);
      const session = extractSession(result.data);
      await applyAuthenticatedSession(session);
      didEmitSessionExpired = false;
      authEvents.emit(AUTH_EVENTS.SESSION_RESTORED, { source: 'login' });
      authMonitor.emit('login_success');
      authMonitor.emit('session_restored', { source: 'login' });
    } catch (error) {
      authMonitor.emit('login_failure', { reason: error instanceof Error ? error.message : 'unknown' });
      throw error;
    }
  },

  async register(input: RegisterInput): Promise<void> {
    authSession.setState({ isLoading: true, authStatus: 'loading' });
    try {
      const deviceSessionId = await getDeviceSessionId();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Session-Id': deviceSessionId },
        body: JSON.stringify(input),
      });
      const result = await parseResponse<any>(response);
      const session = extractSession(result.data);
      await applyAuthenticatedSession(session);
      didEmitSessionExpired = false;
      authEvents.emit(AUTH_EVENTS.SESSION_RESTORED, { source: 'register' });
      authMonitor.emit('session_restored', { source: 'register' });
    } catch (error) {
      authMonitor.emit('login_failure', { reason: error instanceof Error ? error.message : 'unknown', from: 'register' });
      throw error;
    }
  },

  async fetchCurrentUser(accessTokenOverride?: string): Promise<UserDTO> {
    const accessToken = accessTokenOverride || authSession.getAccessToken();
    if (!accessToken) throw new Error('No access token');
    const response = await fetch(`${API_URL}${API_ENDPOINTS.GET_CURRENT_USER}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const result = await parseResponse<UserDTO>(response);
    if (!result.data) throw new Error('User payload missing');
    await authStorage.setUserCache(result.data);
    return result.data;
  },

  async refreshSession(): Promise<string | null> {
    return authRefresh.withRefreshLock(async () => {
      const refreshToken = authSession.getRefreshToken();
      if (!refreshToken) return null;
      authSession.setState({ authStatus: 'refreshing' });
      authMonitor.emit('refresh_attempt');
      const startedAt = Date.now();
      try {
        const deviceSessionId = await getDeviceSessionId();
        const response = await fetch(`${API_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
            'X-Device-Session-Id': deviceSessionId,
          },
        });
        const result = await parseResponse<any>(response);
        const session = extractSession(result.data);
        authSession.setState({ accessToken: session.accessToken });
        if (session.refreshToken) {
          authSession.setRefreshToken(session.refreshToken);
          await authStorage.setRefreshToken(session.refreshToken);
        }
        didEmitSessionExpired = false;
        authEvents.emit(AUTH_EVENTS.SESSION_RESTORED, { source: 'refresh' });
        authMonitor.emit('session_restored', { source: 'refresh' });
        authMonitor.emit('refresh_success');
        authMonitor.emit('refresh_duration_ms', { duration: Date.now() - startedAt });
        return session.accessToken;
      } catch (error) {
        authMonitor.emit('refresh_failure', { reason: error instanceof Error ? error.message : 'unknown' });
        authMonitor.emit('refresh_duration_ms', { duration: Date.now() - startedAt });
        if (isRefreshTokenInvalidError(error)) {
          await this.forceLogout('refresh_token_invalid');
          return null;
        }
        throw error;
      }
    });
  },

  async logout(): Promise<void> {
    try {
      const accessToken = authSession.getAccessToken();
      if (accessToken) {
        await fetch(`${API_URL}${API_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } finally {
      await this.forceLogout('user_logout');
    }
  },

  async forceLogout(reason: string): Promise<void> {
    if (isForceLoggingOut) return;
    isForceLoggingOut = true;
    try {
      authRefresh.clearPending();
      authSession.clearSensitiveMemory();
      await authStorage.clearAuthStorage();
      clearDeviceSessionMemory();
      authSession.setGuest(true);
      authMonitor.emit('logout', { reason });
      if (reason !== 'user_logout' && !didEmitSessionExpired) {
        didEmitSessionExpired = true;
        authEvents.emit(AUTH_EVENTS.SESSION_EXPIRED, { reason });
        authMonitor.emit('session_expired', { reason });
      }
    } finally {
      isForceLoggingOut = false;
    }
  },

  async invalidateSuspiciousSession(reason = 'suspicious_session_detected'): Promise<void> {
    await this.forceLogout(reason);
  },

  async prepareReplayProtectionContext(): Promise<{ deviceSessionId: string }> {
    return {
      deviceSessionId: await getDeviceSessionId(),
    };
  },

  async completeExternalAuthSession(session: ExternalAuthInput): Promise<void> {
    authSession.setState({ isLoading: true, authStatus: 'loading' });
    try {
      await applyAuthenticatedSession(session);
      didEmitSessionExpired = false;
      authEvents.emit(AUTH_EVENTS.SESSION_RESTORED, { source: 'social' });
      authMonitor.emit('session_restored', { source: 'social' });
      authMonitor.emit('login_success', { method: 'social' });
    } catch (error) {
      authMonitor.emit('login_failure', { reason: error instanceof Error ? error.message : 'unknown', from: 'social' });
      throw error;
    }
  },
};
