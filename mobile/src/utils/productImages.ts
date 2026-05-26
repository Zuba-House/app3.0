import { API_URL } from '../constants/config';

/** Turn relative / legacy image paths into absolute URLs. */
export function resolveImageUrl(url: unknown, baseUrl: string = API_URL): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${baseUrl}${trimmed}`;
  return `${baseUrl}/${trimmed}`;
}

function pushUrl(urls: string[], seen: Set<string>, raw: unknown) {
  const resolved = resolveImageUrl(
    typeof raw === 'object' && raw !== null && 'url' in raw
      ? (raw as { url?: string }).url
      : raw
  );
  if (resolved && !seen.has(resolved)) {
    seen.add(resolved);
    urls.push(resolved);
  }
}

/** Collect all displayable image URLs from a product (and optional variation). */
export function collectProductImageUrls(product: any, variation?: any): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const images = product?.images;
  if (Array.isArray(images)) {
    images.forEach((img) => pushUrl(urls, seen, img));
  }

  pushUrl(urls, seen, product?.featuredImage);
  pushUrl(urls, seen, product?.image);
  pushUrl(urls, seen, product?.imageUrl);
  pushUrl(urls, seen, product?.thumbnail);

  if (variation) {
    if (Array.isArray(variation.images)) {
      variation.images.forEach((img: unknown) => pushUrl(urls, seen, img));
    }
    pushUrl(urls, seen, variation.image);
  }

  if (urls.length === 0 && Array.isArray(product?.variations)) {
    for (const v of product.variations) {
      if (Array.isArray(v?.images)) {
        v.images.forEach((img: unknown) => pushUrl(urls, seen, img));
      }
      pushUrl(urls, seen, v?.image);
      if (urls.length > 0) break;
    }
  }

  return urls;
}

/** First displayable image URL for a product card or list row. */
export function getProductPrimaryImageUrl(product: any, variation?: any): string | null {
  const urls = collectProductImageUrls(product, variation);
  return urls[0] ?? null;
}

/** Unwrap single-product API payloads: { product }, nested data, or plain product. */
export function unwrapProductPayload(payload: unknown): any | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  if (p._id && (p.name != null || p.images != null || p.featuredImage != null)) {
    return payload;
  }
  if (p.product && typeof p.product === 'object') {
    return p.product;
  }
  return null;
}
