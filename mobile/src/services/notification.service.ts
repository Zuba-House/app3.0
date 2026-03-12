/**
 * Push Notification Service
 * Handles push notifications for Zuba House App
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { postData } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
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

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'zuba-house-019',
      });
      
      this.expoPushToken = tokenData.data;
      // Logging disabled for production - uncomment for debugging
      // console.log('✅ Push notifications initialized');

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
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Promotions & Deals',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('cart', {
      name: 'Cart Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
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
      const response = await postData('/api/notifications/register-token', {
        pushToken: this.expoPushToken,
        deviceType: Platform.OS,
        userId,
      });

      return response.success || false;
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
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
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

/**
 * Handle notification navigation
 * Call this when user taps on notification
 */
export const handleNotificationNavigation = (
  navigation: any,
  data: NotificationData
) => {
  switch (data.type) {
    case 'order_status':
      if (data.orderId) {
        navigation.navigate('OrderDetails', { orderId: data.orderId });
      } else {
        navigation.navigate('Orders');
      }
      break;
    case 'promotion':
    case 'price_drop':
      if (data.productId) {
        navigation.navigate('ProductDetail', { productId: data.productId });
      } else {
        navigation.navigate('Home');
      }
      break;
    case 'cart_reminder':
      navigation.navigate('Cart');
      break;
    default:
      navigation.navigate('Home');
  }
};
