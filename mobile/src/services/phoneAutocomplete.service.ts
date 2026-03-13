/**
 * Phone autocomplete via backend (same as web): detect country (Canada, Rwanda, etc.) and format.
 * POST /api/shipping/parse-phone
 */

import { API_URL, API_ENDPOINTS } from '../constants/config';

export interface ParsePhoneResult {
  success: boolean;
  valid: boolean;
  countryCode: string | null;
  callingCode: string | null;
  e164: string | null;
  national: string | null;
}

export async function parsePhone(phone: string): Promise<ParsePhoneResult> {
  const raw = (phone != null && typeof phone === 'string') ? phone.trim() : '';
  if (!raw) return { success: true, valid: false, countryCode: null, callingCode: null, e164: null, national: null };

  try {
    if (!API_URL || !API_ENDPOINTS.PARSE_PHONE) {
      return { success: true, valid: false, countryCode: null, callingCode: null, e164: null, national: null };
    }
    const url = `${API_URL}${API_ENDPOINTS.PARSE_PHONE}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: raw }),
    });
    const data = await res.json();
    if (data?.success) {
      return {
        success: true,
        valid: !!data.valid,
        countryCode: data.countryCode ?? null,
        callingCode: data.callingCode ?? null,
        e164: data.e164 ?? null,
        national: data.national ?? null,
      };
    }
    return { success: true, valid: false, countryCode: null, callingCode: null, e164: null, national: null };
  } catch {
    return { success: true, valid: false, countryCode: null, callingCode: null, e164: null, national: null };
  }
}
