/**
 * Builds a Temu-style mixed catalog feed: product pairs, promo strips, mini rows.
 */

import { Product } from '../types/product.types';
import { filterPricedProducts } from './productDisplay';

export type PromoVariant =
  | 'surprise'
  | 'ai_picks'
  | 'lightning'
  | 'hidden_gems'
  | 'best_value'
  | 'fresh_drop';

export type FeedBlock =
  | { id: string; type: 'product_row'; products: Product[] }
  | { id: string; type: 'promo'; variant: PromoVariant; highlight?: Product }
  | { id: string; type: 'horizontal'; title: string; subtitle: string; products: Product[] };

const PROMO_CYCLE: PromoVariant[] = [
  'surprise',
  'ai_picks',
  'lightning',
  'best_value',
  'hidden_gems',
  'fresh_drop',
];

const HORIZONTAL_TITLES: { title: string; subtitle: string }[] = [
  { title: 'Hot right now', subtitle: 'Trending picks' },
  { title: 'Worth a look', subtitle: 'Community favorites' },
  { title: 'Quick wins', subtitle: 'Great value today' },
  { title: 'Just dropped', subtitle: 'New in catalog' },
];

export function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getSaleDiscount(p: Product): number {
  const base = Number(p.price ?? 0);
  const sale = Number(p.salePrice ?? 0);
  const old = Number((p as Record<string, unknown>).oldPrice ?? 0);
  if (sale > 0 && base > sale) return ((base - sale) / base) * 100;
  if (old > base && base > 0) return ((old - base) / old) * 100;
  return 0;
}

function pickHighlight(products: Product[], variant: PromoVariant): Product | undefined {
  if (products.length === 0) return undefined;
  switch (variant) {
    case 'best_value':
      return [...products].sort((a, b) => getSaleDiscount(b) - getSaleDiscount(a))[0];
    case 'hidden_gems':
      return [...products].sort(
        (a, b) =>
          Number((a as Record<string, unknown>).views ?? 0) -
          Number((b as Record<string, unknown>).views ?? 0)
      )[0];
    case 'fresh_drop':
      return [...products].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0];
    default:
      return products[Math.floor(products.length * 0.37)];
  }
}

/**
 * Interleave product pairs with promo strips and occasional horizontal rows.
 */
export function buildMixedFeedBlocks(products: Product[], seed = daySeed()): FeedBlock[] {
  const priced = filterPricedProducts(products);
  const unique = Array.from(new Map(priced.map((p) => [p._id, p])).values());
  if (unique.length === 0) return [];

  const mixed = seededShuffle(unique, seed);
  const blocks: FeedBlock[] = [];
  let promoIndex = 0;
  let horizontalIndex = 0;
  let pairBuffer: Product[] = [];
  let rowIndex = 0;

  const maybeInsertExtras = (cursor: number) => {
    if (rowIndex > 0 && rowIndex % 3 === 0) {
      const variant = PROMO_CYCLE[promoIndex % PROMO_CYCLE.length];
      promoIndex += 1;
      const nearby = mixed.slice(cursor, cursor + 8);
      blocks.push({
        id: `promo-${variant}-${rowIndex}`,
        type: 'promo',
        variant,
        highlight: pickHighlight(nearby.length ? nearby : mixed, variant),
      });
    }
    if (rowIndex > 0 && rowIndex % 5 === 0) {
      const meta = HORIZONTAL_TITLES[horizontalIndex % HORIZONTAL_TITLES.length];
      horizontalIndex += 1;
      const rowProducts = mixed.slice(cursor, cursor + 4);
      if (rowProducts.length >= 2) {
        blocks.push({
          id: `horiz-${horizontalIndex}-${rowProducts[0]._id}`,
          type: 'horizontal',
          title: meta.title,
          subtitle: meta.subtitle,
          products: rowProducts,
        });
      }
    }
  };

  for (let i = 0; i < mixed.length; i++) {
    pairBuffer.push(mixed[i]);
    if (pairBuffer.length === 2 || i === mixed.length - 1) {
      blocks.push({
        id: `row-${rowIndex}-${pairBuffer[0]._id}`,
        type: 'product_row',
        products: [...pairBuffer],
      });
      pairBuffer = [];
      rowIndex += 1;
      maybeInsertExtras(Math.min(i + 1, mixed.length - 1));
    }
  }

  return blocks;
}
