import { fetchDataFromApi } from './api';

/** localStorage: '1' = API works, '0' = skip notification HTTP calls */
const STORAGE_KEY = 'zuba_admin_notifications_api';

/** Force enable via admin/.env — VITE_NOTIFICATIONS_API=true */
export function notificationsApiForcedOn() {
  return import.meta.env.VITE_NOTIFICATIONS_API === 'true';
}

export function notificationsApiForcedOff() {
  return import.meta.env.VITE_NOTIFICATIONS_API === 'false';
}

function productionApiLikelyMissingRoutes() {
  const api = String(import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com').replace(
    /\/+$/,
    ''
  );
  return api.includes('onrender.com') && !notificationsApiForcedOn();
}

export function isNotificationsApiDisabled() {
  if (notificationsApiForcedOn()) return false;
  if (notificationsApiForcedOff()) return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === '0') return true;
  if (stored === '1') return false;
  if (productionApiLikelyMissingRoutes()) return true;
  return false;
}

export function markNotificationsApiAvailable() {
  localStorage.setItem(STORAGE_KEY, '1');
}

export function markNotificationsApiUnavailable() {
  localStorage.setItem(STORAGE_KEY, '0');
}

export function resetNotificationsApiProbe() {
  localStorage.removeItem(STORAGE_KEY);
}

let probePromise = null;

/**
 * One probe per page load (or none if already marked unavailable).
 * Returns API history array or null to use local storage.
 */
export async function probeNotificationsApiOnce() {
  if (notificationsApiForcedOff() || isNotificationsApiDisabled()) {
    return null;
  }
  if (localStorage.getItem(STORAGE_KEY) === '1') {
    const res = await fetchDataFromApi('/api/notifications/history', { silent: true });
    if (res?.success && Array.isArray(res?.data)) return res.data;
    markNotificationsApiUnavailable();
    return null;
  }
  if (!probePromise) {
    probePromise = (async () => {
      const res = await fetchDataFromApi('/api/notifications/history', { silent: true });
      if (res?.success && Array.isArray(res?.data)) {
        markNotificationsApiAvailable();
        return res.data;
      }
      markNotificationsApiUnavailable();
      return null;
    })();
  }
  return probePromise;
}

export function shouldCallNotificationsBroadcast() {
  if (notificationsApiForcedOn()) return true;
  if (isNotificationsApiDisabled()) return false;
  return localStorage.getItem(STORAGE_KEY) !== '0';
}
