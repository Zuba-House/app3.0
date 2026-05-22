/** In-memory GET cache for faster repeat loads and offline fallback. */
const CACHE_DURATION_MS = 5 * 60 * 1000;

type CacheEntry = {
  body: unknown;
  timestamp: number;
};

const responseCache = new Map<string, CacheEntry>();

export function getCachedGet<T>(url: string): T | null {
  const entry = responseCache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
    responseCache.delete(url);
    return null;
  }
  return entry.body as T;
}

export function setCachedGet(url: string, body: unknown): void {
  responseCache.set(url, { body, timestamp: Date.now() });
}

export function clearApiCache(): void {
  responseCache.clear();
}

/** Drop cached GET responses (e.g. after cart mutations). */
export function invalidateApiCache(urlPart?: string): void {
  if (!urlPart) {
    responseCache.clear();
    return;
  }
  for (const key of [...responseCache.keys()]) {
    if (key.includes(urlPart)) {
      responseCache.delete(key);
    }
  }
}
