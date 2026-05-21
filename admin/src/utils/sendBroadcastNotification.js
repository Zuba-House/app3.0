import { fetchDataFromApi, postData } from './api';
import {
  appendNotificationHistory,
  loadNotificationHistory,
} from './notificationHistory';
import {
  markNotificationsApiAvailable,
  markNotificationsApiUnavailable,
  probeNotificationsApiOnce,
  shouldCallNotificationsBroadcast,
} from './notificationsApiMode';

export const NOTIFICATIONS_UPDATED_EVENT = 'admin-notifications-updated';

export function dispatchNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

/**
 * Send a broadcast push (defaults to general channel).
 * Falls back to local history when API is unavailable.
 */
export async function sendBroadcastNotification({
  title,
  message,
  channel = 'general',
  audience = 'all',
  sentBy = 'admin',
  actionUrl = '',
  imageUrl = '',
}) {
  const trimmedTitle = String(title || '').trim();
  const trimmedMessage = String(message || '').trim();
  if (!trimmedTitle || !trimmedMessage) {
    return { ok: false, status: 'failed', message: 'Title and message are required.' };
  }

  const payload = {
    title: trimmedTitle,
    message: trimmedMessage,
    channel,
    audience,
    data: {
      url: actionUrl?.trim() || null,
      image: imageUrl?.trim() || null,
      sentAt: new Date().toISOString(),
      sentBy,
    },
  };

  let status = 'queued';
  let apiNote = 'Saved locally — notification API not available on this server yet.';
  let recipientCount = 0;

  if (shouldCallNotificationsBroadcast()) {
    const res = await postData('/api/notifications/broadcast', payload);
    const apiOk = res?.ok === true || res?.success === true;

    if (apiOk) {
      markNotificationsApiAvailable();
      const data = res?.data ?? res;
      status = data?.status === 'failed' ? 'failed' : 'sent';
      recipientCount = data?.sent ?? data?.successCount ?? res?.sent ?? 0;
      const total = data?.total ?? recipientCount;
      const failed = data?.failed ?? data?.failureCount ?? 0;
      apiNote =
        recipientCount > 0
          ? `Sent to ${recipientCount}/${total} device${total === 1 ? '' : 's'}${failed > 0 ? ` (${failed} failed)` : ''}.`
          : data?.message || 'Saved — no devices registered yet.';
    } else if (res?.httpStatus === 404) {
      markNotificationsApiUnavailable();
    } else if (!res || res.httpStatus === 0) {
      apiNote = 'Saved locally — could not reach API.';
    } else {
      apiNote = res?.message || 'API error — saved to history.';
    }
  }

  const entry = {
    id: `${Date.now()}`,
    ...payload,
    body: trimmedMessage,
    status,
    sentAt: new Date().toISOString(),
    apiNote,
    recipientCount,
    read: true,
  };
  appendNotificationHistory(entry);
  dispatchNotificationsUpdated();

  const userMessage =
    status === 'sent' && recipientCount > 0
      ? apiNote
      : status === 'sent'
        ? 'Notification logged. No push tokens registered yet.'
        : apiNote;

  return {
    ok: true,
    status,
    message: userMessage,
    entry,
    recipientCount,
  };
}

export async function loadNotificationList() {
  const fromApi = await probeNotificationsApiOnce();
  if (fromApi) return fromApi;
  return loadNotificationHistory();
}

/** Badge for sidebar — API unread count with local fallback */
export async function getNotificationBadgeCount() {
  const res = await fetchDataFromApi('/api/notifications/unread-count', {
    silent: true,
  });
  const count = res?.data?.count ?? res?.count;
  if (count != null) return Number(count) || 0;

  const history = await loadNotificationList();
  return history.filter(
    (n) => n.status === 'sent' || n.status === 'queued' || n.status === 'partial'
  ).length;
}
