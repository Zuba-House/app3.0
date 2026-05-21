import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  loadNotificationPreferences,
  NotificationPreferences,
} from './settingsStorage';
import type { NotificationData } from '../services/notification.service';

let cached: NotificationPreferences | null = null;

export async function refreshNotificationPrefsCache(): Promise<NotificationPreferences> {
  cached = await loadNotificationPreferences();
  return cached;
}

export function getNotificationPrefsSync(): NotificationPreferences {
  return cached ?? DEFAULT_NOTIFICATION_PREFERENCES;
}

export function shouldShowNotificationType(data: Partial<NotificationData>): boolean {
  const prefs = getNotificationPrefsSync();
  const type = data.type;
  const status = String((data as Record<string, unknown>).status ?? '').toLowerCase();

  if (type === 'order_status') {
    if (status.includes('cancel')) return prefs.orderCancelled;
    if (status.includes('deliver')) return prefs.orderDelivered;
    if (status.includes('ship') || status.includes('out for')) return prefs.orderShipped;
    return prefs.orderConfirmed;
  }
  if (type === 'promotion' || type === 'price_drop') {
    return prefs.flashSales || prefs.appOffers;
  }
  if (type === 'cart_reminder') {
    return prefs.newArrivals;
  }
  if (type === 'general') {
    return prefs.accountActivity;
  }
  return true;
}
