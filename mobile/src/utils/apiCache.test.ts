import { clearApiCache, getCachedGet, invalidateApiCache, setCachedGet } from './apiCache';

describe('apiCache', () => {
  beforeEach(() => {
    clearApiCache();
  });

  it('invalidateApiCache removes entries matching url part', () => {
    setCachedGet('/api/cart/get', { data: [] });
    setCachedGet('/api/product/list', { data: [1] });
    invalidateApiCache('/api/cart');
    expect(getCachedGet('/api/cart/get')).toBeNull();
    expect(getCachedGet('/api/product/list')).not.toBeNull();
  });

  it('clearApiCache removes all entries', () => {
    setCachedGet('/api/cart/get', { data: [] });
    clearApiCache();
    expect(getCachedGet('/api/cart/get')).toBeNull();
  });
});
