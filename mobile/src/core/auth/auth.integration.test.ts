import { authManager } from './authManager';
import { authSession } from './authSession';
import { postData } from '../../services/api';

jest.mock('./authStorage', () => ({
  authStorage: {
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clearRefreshToken: jest.fn(),
    getUserCache: jest.fn(),
    setUserCache: jest.fn(),
    clearUserCache: jest.fn(),
    clearAuthStorage: jest.fn(),
  },
}));

jest.mock('./authDevice', () => ({
  getDeviceSessionId: jest.fn(async () => 'device-1'),
  clearDeviceSessionMemory: jest.fn(),
}));

jest.mock('../../services/wishlist.service', () => ({
  wishlistService: {
    mergeLocalWishlistToCloud: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('auth integration', () => {
  const { authStorage } = jest.requireMock('./authStorage') as {
    authStorage: {
      getRefreshToken: jest.Mock;
      clearAuthStorage: jest.Mock;
    };
  };

  beforeEach(() => {
    authSession.resetForTests();
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as any;
  });

  it('bootstrap restore success', async () => {
    authStorage.getRefreshToken.mockResolvedValue('r1');
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { accessToken: 'a2', refreshToken: 'r2' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { _id: 'u1', name: 'User', email: 'u@x.com', role: 'USER' } }) });

    await authManager.bootstrap();

    expect(authManager.getState().authStatus).toBe('authenticated');
    expect(authManager.getState().accessToken).toBe('a2');
  });

  it('bootstrap restore failure becomes guest', async () => {
    authStorage.getRefreshToken.mockResolvedValue('r1');
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ message: '401' }) });

    await authManager.bootstrap();

    expect(authManager.getState().authStatus).toBe('guest');
    expect(authStorage.clearAuthStorage).toHaveBeenCalled();
  });

  it('expired refresh token forces logout cleanup', async () => {
    authStorage.getRefreshToken.mockResolvedValue('r1');
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'refresh token invalid 401' }) });

    await authManager.bootstrap();

    expect(authManager.getState().authStatus).toBe('guest');
    expect(authStorage.clearAuthStorage).toHaveBeenCalled();
  });

  it('concurrent 401 requests share single refresh lock', async () => {
    authStorage.getRefreshToken.mockResolvedValue(null);
    authSession.setRefreshToken('refresh-1');
    authSession.setState({ accessToken: 'access-1', authStatus: 'authenticated', isHydrated: true });
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'expired' }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'expired' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { accessToken: 'access-2', refreshToken: 'refresh-2' } }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, data: { result: true } }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, data: { result: true } }) });

    await Promise.all([postData('/api/test', {}), postData('/api/test', {})]);

    const refreshCalls = (globalThis.fetch as jest.Mock).mock.calls.filter((call) => String(call[0]).includes('/refresh-token'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('network interruption during refresh does not force logout', async () => {
    authSession.setRefreshToken('refresh-1');
    authSession.setState({ accessToken: 'access-1', authStatus: 'authenticated', isHydrated: true });
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'expired' }) })
      .mockRejectedValueOnce(new Error('Network request failed'));

    await expect(postData('/api/test', {})).rejects.toThrow();
    expect(authManager.getState().authStatus).not.toBe('guest');
  });

  it('guest to authenticated transition', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { accessToken: 'a1', refreshToken: 'r1' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { _id: 'u1', name: 'User', email: 'u@x.com', role: 'USER' } }) });
    await authManager.login({ email: 'u@x.com', password: 'password123' });
    expect(authManager.getState().authStatus).toBe('authenticated');
  });

  it('authenticated to expired session transition', async () => {
    authSession.setRefreshToken('r1');
    authSession.setState({ accessToken: 'a1', authStatus: 'authenticated', isHydrated: true });
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'refresh token invalid 401' }),
    });
    await authManager.refreshSession();
    expect(authManager.getState().authStatus).toBe('guest');
  });
});
