export function countryCodeToFlag(code) {
  const c = String(code || '').trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return null;
  return String.fromCodePoint(
    ...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
}

export function extractCountryFromAddressDoc(doc) {
  if (!doc) return null;
  const name = String(doc.address?.country || doc.country || '').trim();
  if (!name) return null;
  const code =
    String(doc.address?.countryCode || doc.countryCode || '')
      .trim()
      .toUpperCase() || null;
  return { name, code };
}

export function extractCountryFromOrderDoc(doc) {
  if (!doc) return null;
  const ship = doc.shippingAddress;
  if (ship?.country) {
    return {
      name: String(ship.country).trim(),
      code:
        String(ship.countryCode || '')
          .trim()
          .toUpperCase() || null,
    };
  }
  const addr = doc.delivery_address;
  if (addr && typeof addr === 'object' && !Array.isArray(addr)) {
    return extractCountryFromAddressDoc(addr);
  }
  return null;
}

export function buildCountryBreakdown(userCountryMap) {
  const countryCounts = new Map();

  for (const c of userCountryMap.values()) {
    if (!c?.name) continue;
    const prev = countryCounts.get(c.name) || {
      country: c.name,
      countryCode: c.code,
      count: 0,
    };
    prev.count += 1;
    if (!prev.countryCode && c.code) prev.countryCode = c.code;
    countryCounts.set(c.name, prev);
  }

  const total = [...countryCounts.values()].reduce((sum, row) => sum + row.count, 0);

  const countries = [...countryCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((row) => ({
      country: row.country,
      countryCode: row.countryCode,
      count: row.count,
      users: row.count,
      percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
      flag: countryCodeToFlag(row.countryCode) || '🌍',
    }));

  return { countries, total };
}

export async function collectUserCountriesFromDb(mongoose) {
  const userCountryMap = new Map();

  const addUserCountry = (userId, country) => {
    if (!userId || !country?.name) return;
    const key = String(userId);
    if (!userCountryMap.has(key)) {
      userCountryMap.set(key, country);
    }
  };

  let AddressModel = null;
  let OrderModel = null;

  try {
    const addressMod = await import('../models/address.model.js');
    AddressModel = addressMod.default;
  } catch {
    AddressModel = null;
  }

  try {
    const orderMod = await import('../models/order.model.js');
    OrderModel = orderMod.default;
  } catch {
    OrderModel = null;
  }

  if (AddressModel) {
    const addresses = await AddressModel.find({
      $or: [
        { country: { $exists: true, $ne: '' } },
        { 'address.country': { $exists: true, $ne: '' } },
      ],
    })
      .select('userId country countryCode address')
      .lean();

    for (const doc of addresses) {
      const country = extractCountryFromAddressDoc(doc);
      addUserCountry(doc.userId, country);
    }
  } else if (mongoose.connection?.db) {
    const addresses = await mongoose.connection.db
      .collection('addresses')
      .find({
        $or: [
          { country: { $exists: true, $ne: '' } },
          { 'address.country': { $exists: true, $ne: '' } },
        ],
      })
      .project({ userId: 1, country: 1, countryCode: 1, address: 1 })
      .toArray();

    for (const doc of addresses) {
      const country = extractCountryFromAddressDoc(doc);
      addUserCountry(doc.userId, country);
    }
  }

  if (OrderModel) {
    const orders = await OrderModel.find({
      userId: { $exists: true, $ne: null },
      $or: [
        { 'shippingAddress.country': { $exists: true, $ne: '' } },
        { delivery_address: { $exists: true, $ne: null } },
      ],
    })
      .select('userId shippingAddress delivery_address')
      .populate('delivery_address')
      .lean();

    for (const doc of orders) {
      const uid = doc.userId?._id || doc.userId;
      if (userCountryMap.has(String(uid))) continue;
      const country = extractCountryFromOrderDoc(doc);
      addUserCountry(uid, country);
    }
  } else if (mongoose.connection?.db) {
    const orders = await mongoose.connection.db
      .collection('orders')
      .find({
        userId: { $exists: true, $ne: null },
        'shippingAddress.country': { $exists: true, $ne: '' },
      })
      .project({ userId: 1, shippingAddress: 1 })
      .toArray();

    for (const doc of orders) {
      if (userCountryMap.has(String(doc.userId))) continue;
      const country = extractCountryFromOrderDoc(doc);
      addUserCountry(doc.userId, country);
    }
  }

  return userCountryMap;
}
