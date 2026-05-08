import { useState } from 'react';
import { authFeatureApi } from '../auth.api';
import { toUserFriendlyAuthError } from '../auth.errors';
import { validateForgotPassword } from '../auth.validators';

export function useForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (email: string): Promise<boolean> => {
    const errors = validateForgotPassword({ email });
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await authFeatureApi.forgotPassword({ email: email.trim().toLowerCase() });
      return result.success;
    } catch (err) {
      setError(toUserFriendlyAuthError(err, 'Failed to start reset flow'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, error, submitting };
}
