/**
 * In-memory OTP rate limit: max 5 attempts per email per minute.
 * For production at scale, use Redis.
 */
const otpAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

export function checkOtpRateLimit(email) {
    const key = (email || '').toLowerCase().trim();
    if (!key) return { allowed: true };

    const now = Date.now();
    let record = otpAttempts.get(key);

    if (!record) {
        otpAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true };
    }

    if (now >= record.resetAt) {
        record = { count: 1, resetAt: now + WINDOW_MS };
        otpAttempts.set(key, record);
        return { allowed: true };
    }

    record.count += 1;
    if (record.count > MAX_ATTEMPTS) {
        return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
    }
    return { allowed: true };
}
