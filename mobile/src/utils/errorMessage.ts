/**
 * Normalize thrown values from fetch/API (Error or { message }, etc.) for UI copy.
 */

export function getUserFacingErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) {
      return sanitizeTechnicalNoise(m.trim(), fallback);
    }
  }
  if (err instanceof Error && err.message.trim()) {
    return sanitizeTechnicalNoise(err.message.trim(), fallback);
  }
  return fallback;
}

/** Avoid showing raw HTTP fragments when the API already failed meaningfully elsewhere. */
function sanitizeTechnicalNoise(message: string, fallback: string): string {
  if (/Network request failed/i.test(message)) {
    return 'Network error. Please check your internet connection.';
  }
  if (/Request failed with status \d+/i.test(message) && message.length < 120) {
    return fallback;
  }
  return message;
}
