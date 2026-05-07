import { useState } from 'react';
import { authFeatureApi } from '../auth.api';
import { validateVerifyOtp } from '../auth.validators';
import { VerifyOtpDTO } from '../types';

export function useVerifyOtp() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verifyEmail = async (payload: VerifyOtpDTO): Promise<boolean> => {
    const errors = validateVerifyOtp(payload);
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await authFeatureApi.verifyEmailOtp(payload);
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const verifyForgotPassword = async (payload: VerifyOtpDTO): Promise<boolean> => {
    const errors = validateVerifyOtp(payload);
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await authFeatureApi.verifyForgotPasswordOtp(payload);
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { verifyEmail, verifyForgotPassword, error, submitting };
}
