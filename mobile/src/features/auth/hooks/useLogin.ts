import { useState } from 'react';
import { useAuthState } from '../../../core/auth/authGuards';
import { toLoginPayload } from '../auth.mappers';
import { validateLogin } from '../auth.validators';
import { LoginDTO } from '../types';

export function useLogin() {
  const { login } = useAuthState();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (input: LoginDTO): Promise<boolean> => {
    const errors = validateLogin(input);
    if (errors.length > 0) {
      setError(errors[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(toLoginPayload(input));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, error, submitting };
}
