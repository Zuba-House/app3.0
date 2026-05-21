import i18n from '../i18n';
import {
  AppCurrency,
  DEFAULT_RATES,
  formatPriceWithRates,
} from './currencyDetect';

let activeCurrency: AppCurrency = 'CAD';
let activeRates: Record<AppCurrency, number> = { ...DEFAULT_RATES };

export function setActiveCurrency(code: AppCurrency): void {
  activeCurrency = code;
}

export function getActiveCurrency(): AppCurrency {
  return activeCurrency;
}

export function setActiveRates(rates: Record<AppCurrency, number>): void {
  activeRates = { CAD: 1, USD: rates.USD ?? DEFAULT_RATES.USD, EUR: rates.EUR ?? DEFAULT_RATES.EUR };
}

export function convertFromCad(amountCad: number, code: AppCurrency = activeCurrency): number {
  const rate = activeRates[code] ?? 1;
  return amountCad * rate;
}

export function formatMoney(amountCad: number, code: AppCurrency = activeCurrency): string {
  if (!Number.isFinite(amountCad) || amountCad <= 0) {
    return i18n.t('product.priceUnavailable');
  }
  return formatPriceWithRates(amountCad, code, activeRates);
}
