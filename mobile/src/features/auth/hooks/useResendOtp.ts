import { useCallback, useEffect, useState } from 'react';
import { authFeatureApi } from '../auth.api';
import { toUserFriendlyAuthError } from '../auth.errors';

const COOLDOWN_SECONDS = 60;

export function useResendOtp(email: string, purpose: 'verifyEmail' | 'forgotPassword') {
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resend = useCallback(async (): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || cooldown > 0) return false;

    setSubmitting(true);
    setError(null);
    try {
      // Backend reuses OTP storage; forgot-password endpoint resends a 6-digit code.
      const result = await authFeatureApi.forgotPassword({ email: normalizedEmail });
      if (!result?.success) {
        setError('Could not resend code. Please try again.');
        return false;
      }
      setCooldown(COOLDOWN_SECONDS);
      return true;
    } catch (err) {
      setError(toUserFriendlyAuthError(err, 'Could not resend code. Please try again.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [cooldown, email, purpose]);

  return { resend, cooldown, submitting, error, canResend: cooldown === 0 && !submitting };
}
