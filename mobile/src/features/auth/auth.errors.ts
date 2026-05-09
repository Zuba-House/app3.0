export function toUserFriendlyAuthError(input: unknown, fallback: string): string {
  const raw = input instanceof Error ? input.message : String(input || '');
  const message = raw.toLowerCase();

  if (message.includes('/api/user/me') || message.includes('route get')) {
    return 'Unable to complete sign-in right now. Please try again in a moment.';
  }
  if (message.includes('request timed out') || message.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network issue detected. Check your connection and try again.';
  }
  if (message.includes('invalid credentials') || message.includes('invalid email or password')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('oauth') || message.includes('google')) {
    return 'Please continue with email sign-in.';
  }
  if (message.includes('not verify yet') || message.includes('verify your email first')) {
    return 'Please verify your email first, then sign in.';
  }
  if (message.includes('contact to admin') || message.includes('not active')) {
    return 'Your account is currently inactive. Please contact support.';
  }
  if (message.includes('too many otp requests') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a bit and try again.';
  }
  if (message.includes('illegal arguments')) {
    return 'Something went wrong while updating your password. Please request a new code and try again.';
  }
  if (message.includes('verify otp first') || message.includes('confirm your reset code')) {
    return 'Please confirm the reset code before setting a new password.';
  }
  if (message.includes('otp expired') || message.includes('reset code has expired') || message.includes('reset link expired')) {
    return 'Your reset code has expired. Please request a new one.';
  }
  if (message.includes('invalid otp')) {
    return 'That code is not valid. Please check and try again.';
  }
  if (message.includes('email not available') || message.includes('could not find an account')) {
    return 'We could not find an account with that email.';
  }
  if (message.includes('passwords do not match') || message.includes('must be same')) {
    return 'Passwords do not match.';
  }
  if (message.includes('at least 8 characters')) {
    return 'Password must be at least 8 characters.';
  }
  if (message.includes('not found')) {
    return 'Service is temporarily unavailable. Please try again shortly.';
  }

  return raw || fallback;
}
