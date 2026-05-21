/**
 * Registers push token and shows in-app alerts when notifications arrive.
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { rootNavigationRef } from '../navigation/rootNavigationRef';
import { useAuthState } from '../core/auth/authGuards';
import {
  notificationService,
  handleNotificationNavigation,
  parseNotificationPayload,
  presentInAppNotification,
} from '../services/notification.service';

export function usePushNotifications(): void {
  const { authStatus, user } = useAuthState();

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      notificationService.removeListeners();
      return;
    }

    let mounted = true;

    (async () => {
      const { refreshNotificationPrefsCache } = await import('../utils/notificationPrefs');
      await refreshNotificationPrefsCache();
      await notificationService.initialize();
      if (!mounted) return;
      await notificationService.registerTokenWithBackend(user?._id);
    })();

    notificationService.addListeners(
      (notification) => {
        const payload = parseNotificationPayload(notification);
        presentInAppNotification(payload);
      },
      (response) => {
        if (!rootNavigationRef.isReady()) return;
        const payload = parseNotificationPayload(response.notification);
        handleNotificationNavigation(rootNavigationRef, payload);
      }
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response || !rootNavigationRef.isReady()) return;
      const payload = parseNotificationPayload(response.notification);
      handleNotificationNavigation(rootNavigationRef, payload);
    });

    return () => {
      mounted = false;
      notificationService.removeListeners();
    };
  }, [authStatus, user?._id]);
}
