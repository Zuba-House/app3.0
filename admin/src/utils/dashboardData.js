/** Group records by YYYY-MM-DD for chart display */
export function groupCountByDate(items, dateField = 'createdAt') {
  if (!Array.isArray(items) || items.length === 0) return [];

  const byDay = {};
  items.forEach((item) => {
    const raw = item?.[dateField];
    const day =
      typeof raw === 'string'
        ? raw.slice(0, 10)
        : raw
          ? new Date(raw).toISOString().slice(0, 10)
          : null;
    if (!day) return;
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));
}

export function countSinceMonthStart(items, dateField = 'createdAt') {
  if (!Array.isArray(items)) return 0;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return items.filter((item) => {
    const d = item?.[dateField];
    if (!d) return false;
    return new Date(d).getTime() >= start.getTime();
  }).length;
}

export function sumOrderRevenueThisMonth(orders) {
  if (!Array.isArray(orders)) return null;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  let sum = 0;
  let any = false;
  orders.forEach((o) => {
    const d = o?.createdAt;
    if (!d || new Date(d).getTime() < start.getTime()) return;
    const amount =
      o?.totalAmt ??
      o?.totalAmount ??
      o?.total ??
      o?.paymentDetails?.amount ??
      0;
    if (amount) {
      sum += Number(amount) || 0;
      any = true;
    }
  });
  return any ? sum : null;
}
