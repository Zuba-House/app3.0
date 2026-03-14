/**
 * Address autofill: same as web via backend (address autocomplete when typing).
 * Uses backend GET /api/shipping/address-autocomplete when API_URL is set; fallback to Nominatim.
 * Use my location: reverse geocode (Nominatim).
 */

import { API_URL, API_ENDPOINTS } from '../constants/config';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'ZubaHouseApp/1.0';

export interface AddressSuggestion {
  displayName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  /** When set, fetch full address via address-details (Google Places) */
  placeId?: string;
}

function parseAddressFromNominatim(addr: Record<string, string>): Partial<AddressSuggestion> {
  if (!addr) return {};
  const road = addr.road || '';
  const houseNumber = addr.house_number || '';
  const addressLine1 = `${houseNumber} ${road}`.trim() || addr.suburb || addr.village || addr.town || addr.city || '';
  return {
    addressLine1,
    city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
    state: addr.state || addr.county || '',
    postalCode: addr.postcode || '',
    country: addr.country || '',
    countryCode: (addr.country_code || '').toUpperCase(),
  };
}

/**
 * Reverse geocode: lat/lon -> address components (for "Use my location")
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<Partial<AddressSuggestion>> {
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
    });
    const data = await res.json();
    if (data?.address) {
      return {
        ...parseAddressFromNominatim(data.address),
        displayName: data.display_name || '',
      };
    }
    return {};
  } catch {
    return {};
  }
}

const ADDRESS_CACHE_MAX = 50;
const addressSearchCache = new Map<string, AddressSuggestion[]>();

/**
 * Search addresses by query (for "Search address" autocomplete).
 * Uses backend API (Google Places + Nominatim fallback); caches results for performance.
 * Debounce 300ms at call site. Min query length 2.
 */
export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();
  const cached = addressSearchCache.get(q);
  if (cached !== undefined) return cached;
  let result: AddressSuggestion[] = [];
  try {
    if (API_URL && API_ENDPOINTS.ADDRESS_AUTOCOMPLETE) {
      const url = `${API_URL}${API_ENDPOINTS.ADDRESS_AUTOCOMPLETE}?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (json?.success && Array.isArray(json.suggestions)) {
        result = json.suggestions;
        if (addressSearchCache.size >= ADDRESS_CACHE_MAX) {
          const first = addressSearchCache.keys().next().value;
          if (first) addressSearchCache.delete(first);
        }
        addressSearchCache.set(q, result);
        return result;
      }
    }
  } catch {
    // fallback to Nominatim
  }
  try {
    let searchQ = q;
    if (/\bchem\b/i.test(q) && !/\bchemin\b/i.test(q)) {
      searchQ = q.replace(/\bchem\b/gi, 'chemin');
    }
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(searchQ)}&format=json&addressdetails=1&limit=8`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    result = data.map((item: any) => {
      const addr = item.address || {};
      const parsed = parseAddressFromNominatim(addr);
      return {
        displayName: item.display_name || '',
        addressLine1: parsed.addressLine1 || item.name || '',
        city: parsed.city || '',
        state: parsed.state || '',
        postalCode: parsed.postalCode || '',
        country: parsed.country || '',
        countryCode: parsed.countryCode || '',
      };
    });
    if (addressSearchCache.size >= ADDRESS_CACHE_MAX) {
      const first = addressSearchCache.keys().next().value;
      if (first) addressSearchCache.delete(first);
    }
    addressSearchCache.set(q, result);
    return result;
  } catch {
    return [];
  }
}

/**
 * Fetch full address for a Google Place ID (when user selects a Google suggestion).
 */
export async function fetchAddressDetails(placeId: string): Promise<AddressSuggestion | null> {
  if (!placeId) return null;
  try {
    if (API_URL && API_ENDPOINTS.ADDRESS_DETAILS) {
      const url = `${API_URL}${API_ENDPOINTS.ADDRESS_DETAILS}?place_id=${encodeURIComponent(placeId)}`;
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (json?.success && json?.address) return json.address as AddressSuggestion;
    }
  } catch {
    // ignore
  }
  return null;
}
