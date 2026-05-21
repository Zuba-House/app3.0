import { Product } from '../types/product.types';
import { formatMoney } from './currencyFormat';

export function getDisplayPrice(product: Product): number {
  const parentSale = Number(product.salePrice ?? 0);
  const parentPrice = Number(product.price ?? 0);
  const variationPrices = Array.isArray(product.variations)
    ? product.variations
        .map((v) => Number(v?.salePrice ?? v?.price ?? 0))
        .filter((p) => Number.isFinite(p) && p > 0)
    : [];
  const minVariation = variationPrices.length > 0 ? Math.min(...variationPrices) : 0;
  if (parentSale > 0) return parentSale;
  if (parentPrice > 0) return parentPrice;
  return minVariation;
}

export function hasValidPrice(product: Product): boolean {
  return getDisplayPrice(product) > 0;
}

export function filterPricedProducts(products: Product[]): Product[] {
  return products.filter(hasValidPrice);
}

export function formatProductPrice(product: Product): string {
  const price = getDisplayPrice(product);
  return formatMoney(price);
}

export function getSoldPercent(product: Product): number {
  const stock = Number(product.stock ?? 0);
  const total = Number((product as unknown as Record<string, unknown>).totalStock ?? stock + 50);
  if (total <= 0) return 0;
  const sold = Math.max(0, total - stock);
  return Math.min(100, Math.round((sold / total) * 100));
}

export function isAlmostGone(product: Product): boolean {
  const sold = getSoldPercent(product);
  if (sold > 80) return true;
  const stock = Number(product.stock ?? 0);
  if (stock > 0 && stock <= 5) return true;
  return false;
}
