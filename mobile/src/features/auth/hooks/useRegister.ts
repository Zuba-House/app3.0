import { useState } from 'react';
import { authFeatureApi } from '../auth.api';
import { validateRegister } from '../auth.validators';
import { RegisterDTO } from '../types';

export function useRegister() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (input: RegisterDTO): Promise<boolean> => {
    const errors = validateRegister(input);
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      };
      await authFeatureApi.register(payload);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, error, submitting };
}
