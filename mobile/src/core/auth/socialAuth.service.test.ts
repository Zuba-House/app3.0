import { socialAuthService } from './socialAuth.service';

jest.mock('../../features/auth/auth.api', () => ({
  authFeatureApi: {
    exchangeSocialToken: jest.fn(),
  },
}));

jest.mock('./authManager', () => ({
  authManager: {
    prepareReplayProtectionContext: jest.fn(async () => ({ deviceSessionId: 'device-1' })),
    completeExternalAuthSession: jest.fn(async () => undefined),
  },
}));

describe('socialAuthService', () => {
  const { authFeatureApi } = jest.requireMock('../../features/auth/auth.api') as {
    authFeatureApi: { exchangeSocialToken: jest.Mock };
  };
  const { authManager } = jest.requireMock('./authManager') as {
    authManager: { completeExternalAuthSession: jest.Mock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates google and hydrates auth manager session', async () => {
    authFeatureApi.exchangeSocialToken.mockResolvedValue({
      success: true,
      data: { accessToken: 'access-1', refreshToken: 'refresh-1' },
    });

    await socialAuthService.authenticate({
      provider: 'google',
      authorizationCode: 'code-1',
      codeVerifier: 'verifier-1',
      redirectUri: 'zuba://redirect',
      clientId: 'google-client-id',
    });

    expect(authFeatureApi.exchangeSocialToken).toHaveBeenCalledWith(
      'google',
      expect.objectContaining({
        code: 'code-1',
        code_verifier: 'verifier-1',
        redirect_uri: 'zuba://redirect',
      })
    );
    expect(authManager.completeExternalAuthSession).toHaveBeenCalledWith({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
  });

  it('throws on invalid google exchange payload', async () => {
    authFeatureApi.exchangeSocialToken.mockResolvedValue({
      success: true,
      data: {},
    });

    await expect(
      socialAuthService.authenticate({
        provider: 'google',
        authorizationCode: 'code-1',
        codeVerifier: 'verifier-1',
        redirectUri: 'zuba://redirect',
      })
    ).rejects.toThrow('Google exchange did not return a valid session');
  });
});
