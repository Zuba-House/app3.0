import { fetchDataFromApi } from './api';

export const APP_ACTIVITY_UPDATED_EVENT = 'admin-app-activity-updated';
const SEEN_KEY = 'admin_activity_seen_at';
const CACHE_MS = 45_000;

let cache = { at: 0, items: [] };

function normStatus(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .trim();
}

function orderRef(order) {
  const id = String(order?._id || '');
  return id.length > 6 ? `#${id.slice(-6).toUpperCase()}` : id ? `#${id}` : 'Order';
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isReceivedStatus(status) {
  const s = normStatus(status);
  return ['received', 'pending', 'confirm', 'confirmed'].includes(s);
}

function isDeliveryStatus(status) {
  const s = normStatus(status);
  return [
    'processing',
    'shipped',
    'out for delivery',
    'delivered',
    'cancelled',
    'canceled',
  ].includes(s);
}

function deliveryTitle(status) {
  const s = normStatus(status);
  if (s === 'processing') return 'Order processing';
  if (s === 'shipped') return 'Order shipped';
  if (s === 'out for delivery') return 'Out for delivery';
  if (s === 'delivered') return 'Order delivered';
  if (s === 'cancelled' || s === 'canceled') return 'Order cancelled';
  return `Order: ${status}`;
}

function pushItem(items, item) {
  if (!item.at) return;
  items.push({ ...item, relativeAt: formatRelative(item.at) });
}

function buildOrderItems(order, items) {
  const customer =
    order?.userId?.name ||
    order?.userId?.email ||
    order?.email ||
    'Customer';
  const ref = orderRef(order);
  const amount = order?.totalAmt ?? order?.totalAmount ?? order?.total;

  if (Array.isArray(order?.statusHistory) && order.statusHistory.length > 0) {
    order.statusHistory.forEach((entry, idx) => {
      const status = entry.status || entry.order_status;
      const at =
        entry.updatedAt ||
        entry.timestamp ||
        entry.date ||
        order.updatedAt ||
        order.createdAt;
      const s = normStatus(status);
      if (isReceivedStatus(s)) {
        pushItem(items, {
          id: `order-recv-${order._id}-${idx}`,
          type: 'order_received',
          title: 'New order received',
          message: `${customer} · ${ref}${amount != null ? ` · $${Number(amount).toFixed(2)}` : ''}`,
          at,
          link: '/orders',
        });
      } else if (isDeliveryStatus(s)) {
        pushItem(items, {
          id: `order-del-${order._id}-${idx}`,
          type: 'order_delivery',
          title: deliveryTitle(status),
          message: `${customer} · ${ref}`,
          at,
          link: '/orders',
        });
      }
    });
    return;
  }

  const status = order?.status || order?.order_status;
  const at = order?.updatedAt || order?.createdAt;
  if (isReceivedStatus(status)) {
    pushItem(items, {
      id: `order-recv-${order._id}`,
      type: 'order_received',
      title: 'New order received',
      message: `${customer} · ${ref}${amount != null ? ` · $${Number(amount).toFixed(2)}` : ''}`,
      at: order?.createdAt || at,
      link: '/orders',
    });
  } else if (isDeliveryStatus(status)) {
    pushItem(items, {
      id: `order-del-${order._id}`,
      type: 'order_delivery',
      title: deliveryTitle(status),
      message: `${customer} · ${ref}`,
      at,
      link: '/orders',
    });
  }
}

/**
 * Activity from the mobile app: signups, orders, delivery updates.
 */
export async function fetchAppActivityFeed({ force = false } = {}) {
  if (!force && cache.items.length && Date.now() - cache.at < CACHE_MS) {
    return cache.items;
  }

  const items = [];
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const [usersRes, ordersRes] = await Promise.all([
    fetchDataFromApi('/api/user/getAllUsers?page=1&limit=100', { silent: true }),
    fetchDataFromApi('/api/order/order-list?page=1&limit=100', { silent: true }),
  ]);

  const users = usersRes?.users ?? [];
  users.forEach((user) => {
    const at = user.createdAt || user.created_at;
    if (!at || new Date(at).getTime() < cutoff) return;
    pushItem(items, {
      id: `signup-${user._id}`,
      type: 'signup',
      title: 'New user signup',
      message: user.name || user.email || 'New user',
      at,
      link: '/users',
    });
  });

  const orders = ordersRes?.data ?? [];
  orders.forEach((order) => buildOrderItems(order, items));

  const sorted = items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 40);

  cache = { at: Date.now(), items: sorted };
  return sorted;
}

export function getActivitySeenAt() {
  const raw = localStorage.getItem(SEEN_KEY);
  return raw ? new Date(raw).getTime() : 0;
}

export function isActivityUnread(item) {
  return new Date(item.at).getTime() > getActivitySeenAt();
}

export function countUnreadActivity(items) {
  return items.filter(isActivityUnread).length;
}

export async function getAppActivityBadgeCount() {
  const items = await fetchAppActivityFeed();
  return countUnreadActivity(items);
}

export function markAllActivitySeen() {
  localStorage.setItem(SEEN_KEY, new Date().toISOString());
  window.dispatchEvent(new CustomEvent(APP_ACTIVITY_UPDATED_EVENT));
}

export function dispatchAppActivityUpdated() {
  cache = { at: 0, items: [] };
  window.dispatchEvent(new CustomEvent(APP_ACTIVITY_UPDATED_EVENT));
}

export const ACTIVITY_TYPE_LABELS = {
  signup: 'Signup',
  order_received: 'New order',
  order_delivery: 'Delivery',
};

export const ACTIVITY_TYPE_COLORS = {
  signup: 'primary',
  order_received: 'success',
  order_delivery: 'info',
};
