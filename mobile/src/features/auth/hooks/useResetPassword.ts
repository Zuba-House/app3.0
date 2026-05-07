import { useState } from 'react';
import { authFeatureApi } from '../auth.api';
import { validateResetPassword } from '../auth.validators';
import { ResetPasswordDTO } from '../types';

export function useResetPassword() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (payload: ResetPasswordDTO): Promise<boolean> => {
    const errors = validateResetPassword(payload);
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await authFeatureApi.resetPassword(payload);
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, error, submitting };
}
