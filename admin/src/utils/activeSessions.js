const DEFAULT_WINDOW_MINUTES = 30;

export function parseOrdersPayload(res) {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  return payload?.orders ?? [];
}

/** Fallback: users with an order in the last N minutes. */
export function countActiveUsersFromOrders(orders, windowMinutes = DEFAULT_WINDOW_MINUTES) {
  const since = Date.now() - windowMinutes * 60 * 1000;
  const users = new Set();

  for (const order of orders || []) {
    const at = order?.createdAt || order?.date || order?.updatedAt;
    if (!at || new Date(at).getTime() < since) continue;
    const uid = order?.userId?._id || order?.userId;
    if (uid) users.add(String(uid));
  }

  return users.size;
}

export function parseActiveSessionsResponse(res) {
  const payload = res?.data ?? res;
  const count = payload?.activeSessions;
  return count != null && Number.isFinite(Number(count)) ? Number(count) : null;
}

export async function loadActiveSessions(fetchDataFromApi, orders = []) {
  const apiRes = await fetchDataFromApi('/api/analytics/active-sessions', {
    silent: true,
  });
  const fromApi = parseActiveSessionsResponse(apiRes);
  if (fromApi != null) return fromApi;

  const fallback = countActiveUsersFromOrders(orders);
  return fallback > 0 ? fallback : 0;
}
