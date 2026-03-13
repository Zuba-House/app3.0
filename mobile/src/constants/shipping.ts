/**
 * Shipping origin and location-based delivery estimates
 * Default departure: Gatineau, Canada. Customer-facing: Zuba House Regular & Express.
 */

export const SHIPPING_ORIGIN = {
  city: 'Gatineau',
  country: 'Canada',
} as const;

export type DeliveryTier = 'standard' | 'express' | 'overnight';

/** Estimates by destination country (business days). */
const ESTIMATES: Record<string, { standard: string; express: string; overnight: string }> = {
  CA: { standard: '1-5', express: '1-3', overnight: '1' },
  US: { standard: '4-7', express: '2-4', overnight: '1-2' },
};

const DEFAULT_ESTIMATES = { standard: '7-14', express: '5-10', overnight: '3-5' };

/**
 * Get delivery estimate strings (business days) for a country code.
 */
export function getDeliveryEstimate(countryCode: string | null): {
  standard: string;
  express: string;
  overnight: string;
  standardLabel: string;
  expressLabel: string;
} {
  const code = countryCode?.toUpperCase() || '';
  const e = (code && ESTIMATES[code]) ? ESTIMATES[code] : DEFAULT_ESTIMATES;
  return {
    standard: e.standard,
    express: e.express,
    overnight: e.overnight,
    standardLabel: `${e.standard} business days`,
    expressLabel: `${e.express} business days`,
  };
}

/**
 * Get estimated days string for a shipping method id and country (for checkout display).
 */
export function getDeliveryEstimateForMethod(
  methodId: string,
  countryCode: string | null
): string {
  const { standard, express, overnight } = getDeliveryEstimate(countryCode);
  const id = (methodId || '').toLowerCase();
  if (id.includes('standard')) return `${standard} business days`;
  if (id.includes('overnight')) return overnight === '1' ? '1 business day' : `${overnight} business days`;
  return `${express} business days`; // express / fast
}

/**
 * Single line for product detail "Est. Delivery" (standard tier).
 */
export function getEstDeliveryLabel(countryCode: string | null): string {
  const { standard } = getDeliveryEstimate(countryCode);
  return `${standard} business days`;
}
