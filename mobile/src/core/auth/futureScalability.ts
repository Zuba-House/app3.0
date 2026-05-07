export interface SessionCapabilityFlags {
  multiDeviceSessions: boolean;
  biometricUnlock: boolean;
  mfaTotp: boolean;
  sessionManagementUi: boolean;
  adminImpersonation: boolean;
  websocketAuth: boolean;
  roleSegmentation: boolean;
}

export interface SessionDeviceDescriptor {
  deviceSessionId: string;
  platform?: 'ios' | 'android' | 'web';
  appVersion?: string;
}

export interface FutureAuthExtensionPoints {
  capabilities: SessionCapabilityFlags;
  device: SessionDeviceDescriptor;
  mfaChallengeId?: string;
  websocketAuthTokenFactory?: () => Promise<string>;
}

export const futureAuthDefaults: FutureAuthExtensionPoints = {
  capabilities: {
    multiDeviceSessions: true,
    biometricUnlock: false,
    mfaTotp: false,
    sessionManagementUi: false,
    adminImpersonation: false,
    websocketAuth: true,
    roleSegmentation: true,
  },
  device: {
    deviceSessionId: 'pending',
  },
};
