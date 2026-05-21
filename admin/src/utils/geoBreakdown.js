export function countryCodeToFlag(code) {
  const c = String(code || '').trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return '🌍';
  return String.fromCodePoint(
    ...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
}

export function extractCountryFromOrder(order) {
  const ship = order?.shippingAddress;
  if (ship?.country) {
    return {
      name: String(ship.country).trim(),
      code: String(ship.countryCode || '').trim().toUpperCase() || null,
    };
  }

  const addr = order?.delivery_address;
  if (addr) {
    const name = String(addr.address?.country || addr.country || '').trim();
    if (name) {
      return {
        name,
        code:
          String(addr.address?.countryCode || addr.countryCode || '')
            .trim()
            .toUpperCase() || null,
      };
    }
  }

  return null;
}

export function buildGeoFromOrders(orders) {
  const userCountries = new Map();

  for (const order of orders || []) {
    const uid = order?.userId?._id || order?.userId;
    if (!uid) continue;
    const key = String(uid);
    if (userCountries.has(key)) continue;
    const country = extractCountryFromOrder(order);
    if (country?.name) userCountries.set(key, country);
  }

  const counts = new Map();
  for (const c of userCountries.values()) {
    const prev = counts.get(c.name) || {
      country: c.name,
      countryCode: c.code,
      count: 0,
    };
    prev.count += 1;
    if (!prev.countryCode && c.code) prev.countryCode = c.code;
    counts.set(c.name, prev);
  }

  const total = [...counts.values()].reduce((sum, row) => sum + row.count, 0);

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map((row) => ({
      country: row.country,
      countryCode: row.countryCode,
      count: row.count,
      users: row.count,
      percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
      flag: countryCodeToFlag(row.countryCode),
    }));
}

export function parseGeoApiResponse(res) {
  const payload = res?.data ?? res;
  const rows = payload?.countries ?? payload;
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    country: row.country || row._id,
    countryCode: row.countryCode,
    count: row.count ?? row.users ?? 0,
    users: row.users ?? row.count ?? 0,
    percent: row.percent ?? row.pct ?? 0,
    flag: row.flag || countryCodeToFlag(row.countryCode),
  }));
}

export async function fetchOrdersForGeo(fetchDataFromApi) {
  const all = [];
  let page = 1;

  while (page <= 10) {
    const res = await fetchDataFromApi(
      `/api/order/order-list?page=${page}&limit=100`,
      { silent: true }
    );
    if (!res) break;

    const payload = res?.data ?? res;
    const orders = Array.isArray(payload)
      ? payload
      : payload?.orders ?? [];

    if (!orders.length) break;
    all.push(...orders);

    const totalPages = payload?.totalPages ?? 1;
    if (page >= totalPages) break;
    page += 1;
  }

  return all;
}

export async function loadGeoBreakdown(fetchDataFromApi) {
  const apiRes = await fetchDataFromApi('/api/user/geo-breakdown', {
    silent: true,
  });
  const fromApi = parseGeoApiResponse(apiRes);
  if (fromApi.length > 0) return fromApi;

  const orders = await fetchOrdersForGeo(fetchDataFromApi);
  return buildGeoFromOrders(orders);
}
