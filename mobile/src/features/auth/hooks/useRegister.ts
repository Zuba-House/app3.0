import { useState } from 'react';
import { useAuthState } from '../../../core/auth/authGuards';
import { toRegisterPayload } from '../auth.mappers';
import { validateRegister } from '../auth.validators';
import { RegisterDTO } from '../types';

export function useRegister() {
  const { register } = useAuthState();
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
      await register(toRegisterPayload(input));
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
