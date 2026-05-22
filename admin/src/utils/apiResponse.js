/**
 * Unwrap responseNormalizer output to the legacy shape clients expect:
 * { error: false, success: true, products, data, totalPages, ... }
 */
export function toLegacyApiResponse(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const hasNormalizedShape =
    Object.prototype.hasOwnProperty.call(data, 'success') &&
    (Object.prototype.hasOwnProperty.call(data, 'message') ||
      Object.prototype.hasOwnProperty.call(data, 'data'));

  if (!hasNormalizedShape) {
    return data;
  }

  const success = data.success === true;
  const legacy = {
    error: success ? false : true,
    success,
    message: data.message,
  };

  if (data.data === undefined) {
    return legacy;
  }

  if (Array.isArray(data.data)) {
    legacy.data = data.data;
    return legacy;
  }

  if (typeof data.data === 'object' && data.data !== null) {
    Object.assign(legacy, data.data);
    return legacy;
  }

  legacy.data = data.data;
  return legacy;
}

/** Works with both legacy and normalized API responses */
export function isApiSuccess(res) {
  if (!res || res?.isAxiosError) return false;
  if (res?.success === true) return true;
  if (res?.error === false) return true;
  if (res?.error !== true && res?.success !== false && res?.data !== undefined) {
    return true;
  }
  return false;
}
