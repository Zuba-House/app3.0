import { getDeviceRegionCode } from './safeLocalization';

export type AppCurrency = 'CAD' | 'USD' | 'EUR';

const EUR_COUNTRIES = new Set([
  'FR', 'DE', 'IT', 'ES', 'PT', 'AT', 'BE', 'NL', 'IE', 'FI', 'GR', 'LU', 'SK', 'SI',
  'EE', 'LV', 'LT', 'MT', 'CY', 'HR', 'BG', 'RO', 'CZ', 'HU', 'PL', 'DK', 'SE', 'NO',
]);

export const DEFAULT_RATES: Record<AppCurrency, number> = {
  CAD: 1,
  USD: 0.74,
  EUR: 0.68,
};

export const CURRENCY_SYMBOLS: Record<AppCurrency, string> = {
  CAD: 'CA$',
  USD: 'US$',
  EUR: '€',
};

export function detectCurrency(): AppCurrency {
  const region = getDeviceRegionCode() || '';
  if (region === 'CA') return 'CAD';
  if (EUR_COUNTRIES.has(region)) return 'EUR';
  return 'USD';
}

export function normalizeStoredCurrency(raw: string | null): AppCurrency | null {
  if (raw === 'CAD' || raw === 'USD' || raw === 'EUR') return raw;
  return null;
}

export async function fetchLiveRates(): Promise<Partial<Record<AppCurrency, number>>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/CAD', {
      signal: controller.signal,
    });
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data?.rates) return {};
    return {
      CAD: 1,
      USD: Math.round((data.rates.USD ?? DEFAULT_RATES.USD) * 100) / 100,
      EUR: Math.round((data.rates.EUR ?? DEFAULT_RATES.EUR) * 100) / 100,
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

export function formatPriceWithRates(
  priceCAD: number,
  currency: AppCurrency,
  rates: Record<AppCurrency, number>
): string {
  if (!Number.isFinite(priceCAD) || priceCAD <= 0) return '';
  const rate = rates[currency] ?? 1;
  const converted = priceCAD * rate;
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'EUR') {
    return `${converted.toFixed(2)} ${symbol}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
