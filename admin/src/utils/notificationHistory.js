const HISTORY_KEY = 'admin_notification_history';

export function loadNotificationHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotificationHistory(entries) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50)));
}

export function appendNotificationHistory(entry) {
  const list = loadNotificationHistory();
  list.unshift(entry);
  saveNotificationHistory(list);
  return list;
}

export function clearNotificationHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function computeNotificationStats(history) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const sent = history.filter((h) => h.status === 'sent' || h.status === 'queued');
  const thisWeek = sent.filter((h) => new Date(h.sentAt).getTime() >= weekAgo);
  const channelCounts = {};
  sent.forEach((h) => {
    channelCounts[h.channel] = (channelCounts[h.channel] || 0) + 1;
  });
  const mostChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0];
  const last = sent[0];
  const lastRel = last
    ? formatRelative(new Date(last.sentAt))
    : 'Never';
  return {
    totalSent: sent.length,
    sentThisWeek: thisWeek.length,
    mostUsedChannel: mostChannel ? mostChannel[0] : '—',
    lastSentRelative: lastRel,
  };
}

function formatRelative(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
