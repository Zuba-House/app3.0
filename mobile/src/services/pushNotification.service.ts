/**
 * Push token registration — never throws; 404 = route not deployed yet.
 */

import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../constants/config';
import { postDataOptional } from './api';
import { notificationService } from './notification.service';

export const sendTokenToServer = async (token: string): Promise<void> => {
  try {
    const res = await postDataOptional(API_ENDPOINTS.REGISTER_PUSH_TOKEN, {
      token,
      pushToken: token,
      platform: Platform.OS,
      deviceType: Platform.OS,
      deviceName: Device.deviceName || Device.modelName || 'Unknown Device',
    });

    if (res.status === 404) {
      if (__DEV__) {
        console.log(
          '[Push] Token endpoint not deployed yet — will work after server deploy'
        );
      }
      return;
    }

    if (res.ok && res.success !== false) {
      if (__DEV__) console.log('[Push] Token registered ✓');
      return;
    }

    if (__DEV__) {
      console.log('[Push] Token registration skipped:', res.message || res.status);
    }
  } catch {
    if (__DEV__) console.log('[Push] Token registration skipped (network)');
  }
};

/** Register device token and send to API (fire-and-forget). Never blocks login. */
export const setupPushNotifications = async (): Promise<string | null> => {
  try {
    const token = await notificationService.initialize();
    if (token) {
      void sendTokenToServer(token);
    }
    return token;
  } catch (err) {
    if (__DEV__) console.log('[Push] Setup skipped:', err);
    return null;
  }
};
