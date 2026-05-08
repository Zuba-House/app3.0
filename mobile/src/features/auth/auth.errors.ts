export function toUserFriendlyAuthError(input: unknown, fallback: string): string {
  const raw = input instanceof Error ? input.message : String(input || '');
  const message = raw.toLowerCase();

  if (message.includes('/api/user/me') || message.includes('route get')) {
    return 'Unable to complete sign-in right now. Please try again in a moment.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network issue detected. Check your connection and try again.';
  }
  if (message.includes('invalid credentials') || message.includes('invalid email or password')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('oauth') || message.includes('google')) {
    return 'Google sign-in is currently unavailable. Please try email sign-in.';
  }
  if (message.includes('not found')) {
    return 'Service is temporarily unavailable. Please try again shortly.';
  }

  return raw || fallback;
}
