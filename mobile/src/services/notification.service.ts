/**
 * Push Notification Service
 * Handles push notifications for Zuba House App
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../constants/config';
import { deleteData, postData } from './api';
import { showInfo, showSuccess, showWarning } from '../utils/toast';
import { shouldShowNotificationType } from '../utils/notificationPrefs';

// Configure how notifications appear when app is in foreground (banner + sound)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as Record<string, unknown> | undefined;
    const channelId = typeof data?.channelId === 'string' ? data.channelId : 'orders';
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority:
        channelId === 'orders'
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

export interface NotificationData {
  type: 'order_status' | 'promotion' | 'cart_reminder' | 'price_drop' | 'general';
  orderId?: string;
  productId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications
   * Call this when app starts or user logs in
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        // Silently fail for emulators/simulators - this is expected
        return null;
      }

      // Check permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // Permission not granted - silently fail, user can enable later
        return null;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId ??
        'b1c36a7f-6753-42dd-a363-8c673e354a69';

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = tokenData.data;
      if (__DEV__) {
        console.log('[Push] Token:', this.expoPushToken);
      }

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        try {
          await this.setupAndroidChannels();
        } catch (channelError) {
          // Channel setup failed, but continue - not critical
          console.log('Note: Android channel setup failed (non-critical)');
        }
      }

      return this.expoPushToken;
    } catch (error: any) {
      // Silently handle errors - don't show to user
      // Common errors: projectId mismatch, network issues, etc.
      // These are not critical for app functionality
      if (error?.message?.includes('projectId')) {
        console.log('Note: Push notifications require correct projectId in app.json');
      } else {
        console.log('Note: Push notifications unavailable (non-critical)');
      }
      return null;
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels() {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e8a87c',
      sound: 'default',
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Promotions & Deals',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync('cart', {
      name: 'Cart Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  /**
   * Register push token with backend
   */
  async registerTokenWithBackend(userId?: string): Promise<boolean> {
    if (!this.expoPushToken) {
      await this.initialize();
    }

    if (!this.expoPushToken) {
      return false;
    }

    try {
      const response = await postData(API_ENDPOINTS.REGISTER_PUSH_TOKEN, {
        token: this.expoPushToken,
        pushToken: this.expoPushToken,
        platform: Platform.OS,
        deviceType: Platform.OS,
        deviceName: Device.deviceName || Device.modelName || 'Unknown',
        userId,
      });

      if (__DEV__) {
        if (response.success !== false) {
          console.log('[Push] Token sent to server ✓');
        } else {
          console.warn('[Push] Failed to send token:', response.message);
        }
      }

      return response.success !== false;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Add notification listeners
   */
  addListeners(
    onNotification?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for when notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Logging disabled for production - uncomment for debugging
        // console.log('Notification received:', notification);
        if (onNotification) {
          onNotification(notification);
        }
      }
    );

    // Listener for when user interacts with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Logging disabled for production - uncomment for debugging
        // console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Remove notification listeners
   */
  removeListeners() {
    this.notificationListener?.remove?.();
    this.responseListener?.remove?.();
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means immediate
    });

    return identifier;
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Get push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /** Remove token from server on logout */
  async unregisterFromBackend(): Promise<void> {
    try {
      if (!this.expoPushToken) return;
      await deleteData(API_ENDPOINTS.UNREGISTER_PUSH_TOKEN, {
        token: this.expoPushToken,
        pushToken: this.expoPushToken,
      });
      if (__DEV__) console.log('[Push] Token unregistered from server');
    } catch (err) {
      if (__DEV__) console.warn('[Push] Unregister failed (non-critical):', err);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export notification types for navigation
export type NotificationType = 
  | 'order_status'
  | 'promotion'
  | 'cart_reminder'
  | 'price_drop'
  | 'general';

function normalizeNotificationType(raw: unknown): NotificationType {
  const value = String(raw ?? 'general').toLowerCase();
  if (value.includes('order')) return 'order_status';
  if (value.includes('promo') || value.includes('deal')) return 'promotion';
  if (value.includes('cart')) return 'cart_reminder';
  if (value.includes('price')) return 'price_drop';
  return 'general';
}

/** Build user-facing title/body from push payload or backend data object. */
export function formatNotificationMessage(
  data: Partial<NotificationData> & Record<string, unknown>
): { title: string; body: string } {
  const type = data.type ?? normalizeNotificationType(data.type);
  const title = String(data.title ?? '').trim();
  const body = String(data.body ?? data.message ?? '').trim();
  const orderId = data.orderId != null ? String(data.orderId) : undefined;
  const orderNumber = data.orderNumber != null ? String(data.orderNumber) : undefined;
  const status = data.status != null ? String(data.status) : undefined;

  if (type === 'order_status') {
    const ref = orderNumber ? `#${orderNumber}` : orderId ? `#${orderId.slice(-6).toUpperCase()}` : 'your order';
    const statusLabel = status ? status.replace(/_/g, ' ') : '';
    return {
      title: title || (statusLabel ? `Order ${statusLabel}` : 'Order update'),
      body:
        body ||
        (statusLabel
          ? `Your order ${ref} is now ${statusLabel}. Tap to view details.`
          : `There's an update on order ${ref}. Tap to view details.`),
    };
  }

  if (type === 'promotion' || type === 'price_drop') {
    return {
      title: title || 'Special offer',
      body: body || 'Check out the latest deals on Zuba House.',
    };
  }

  if (type === 'cart_reminder') {
    return {
      title: title || 'Items in your cart',
      body: body || 'Complete checkout before items sell out.',
    };
  }

  return {
    title: title || 'Zuba House',
    body: body || 'You have a new notification.',
  };
}

export function parseNotificationPayload(
  notification: Notifications.Notification
): NotificationData {
  const content = notification.request.content;
  const raw = (content.data ?? {}) as Record<string, unknown>;
  const type = normalizeNotificationType(raw.type);
  const formatted = formatNotificationMessage({
    ...raw,
    type,
    title: content.title != null ? String(content.title) : raw.title != null ? String(raw.title) : undefined,
    body:
      content.body != null
        ? String(content.body)
        : raw.body != null
          ? String(raw.body)
          : raw.message != null
            ? String(raw.message)
            : undefined,
    orderId: raw.orderId != null ? String(raw.orderId) : undefined,
    productId: raw.productId != null ? String(raw.productId) : undefined,
  });

  return {
    type,
    title: formatted.title,
    body: formatted.body,
    orderId: raw.orderId != null ? String(raw.orderId) : undefined,
    productId: raw.productId != null ? String(raw.productId) : undefined,
    data: raw,
  };
}

/** In-app toast when a push arrives while the app is open. */
export function presentInAppNotification(data: NotificationData): void {
  if (!shouldShowNotificationType(data)) {
    return;
  }
  const { title, body } = data;
  if (data.type === 'order_status') {
    showSuccess(title, body);
    return;
  }
  if (data.type === 'promotion' || data.type === 'price_drop') {
    showInfo(title, body);
    return;
  }
  if (data.type === 'cart_reminder') {
    showWarning(title, body);
    return;
  }
  showInfo(title, body);
}

/**
 * Handle notification navigation
 * Call this when user taps on notification
 */
export const handleNotificationNavigation = (
  navigation: any,
  data: NotificationData
) => {
  const raw = data.data || {};
  const channel = String(raw.channel || raw.channelId || '').toLowerCase();
  const screen = String(raw.screen || '').trim();
  const orderId = data.orderId || (raw.orderId != null ? String(raw.orderId) : undefined);
  const productId = data.productId || (raw.productId != null ? String(raw.productId) : undefined);

  const navigateMain = (screenName: string, params?: object) => {
    if (navigation.navigate) {
      navigation.navigate('MainApp', {
        screen: screenName,
        params,
      });
    }
  };

  if (screen === 'OrderDetail' && orderId) {
    navigateMain('OrderDetail', { orderId });
    return;
  }

  switch (data.type) {
    case 'order_status':
      if (orderId) {
        navigateMain('OrderDetail', { orderId });
      } else if (channel === 'orders') {
        navigateMain('MainTabs', { screen: 'Orders' });
      } else {
        navigateMain('MainTabs', { screen: 'Orders' });
      }
      break;
    case 'promotion':
    case 'price_drop':
      if (productId) {
        navigateMain('ProductDetail', { productId });
      } else if (channel === 'promotions') {
        navigateMain('MainTabs', { screen: 'Home' });
      } else {
        navigateMain('MainTabs', { screen: 'Home' });
      }
      break;
    case 'cart_reminder':
      navigateMain('Cart');
      break;
    default:
      if (channel === 'cart') {
        navigateMain('Cart');
      } else if (channel === 'orders') {
        navigateMain('MainTabs', { screen: 'Orders' });
      } else {
        navigateMain('MainTabs', { screen: 'Home' });
      }
  }
};
