import { AuthFormError, ForgotPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO, VerifyOtpDTO } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

function required(value: string, field: string, message: string): AuthFormError | null {
  if (!value.trim()) return { field, message };
  return null;
}

export function validateLogin(input: LoginDTO): AuthFormError[] {
  const errors: AuthFormError[] = [];
  const emailRequired = required(input.email, 'email', 'Email is required');
  if (emailRequired) errors.push(emailRequired);
  if (input.email && !EMAIL_REGEX.test(input.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }
  const passwordRequired = required(input.password, 'password', 'Password is required');
  if (passwordRequired) errors.push(passwordRequired);
  return errors;
}

export function validateRegister(input: RegisterDTO): AuthFormError[] {
  const errors: AuthFormError[] = [];
  const nameRequired = required(input.name, 'name', 'Name is required');
  if (nameRequired) errors.push(nameRequired);
  errors.push(...validateLogin({ email: input.email, password: input.password }));
  if (input.password && input.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  return errors;
}

export function validateForgotPassword(input: ForgotPasswordDTO): AuthFormError[] {
  const errors: AuthFormError[] = [];
  const emailRequired = required(input.email, 'email', 'Email is required');
  if (emailRequired) errors.push(emailRequired);
  if (input.email && !EMAIL_REGEX.test(input.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }
  return errors;
}

export function validateResetPassword(input: ResetPasswordDTO): AuthFormError[] {
  const errors: AuthFormError[] = [];
  if (!input.otp.trim()) {
    errors.push({ field: 'otp', message: 'OTP is required' });
  } else if (!OTP_REGEX.test(input.otp.trim())) {
    errors.push({ field: 'otp', message: 'OTP must be a 6-digit code' });
  }
  if (!input.newPassword.trim()) errors.push({ field: 'newPassword', message: 'New password is required' });
  if (!input.confirmPassword.trim()) errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  if (input.newPassword && input.confirmPassword && input.newPassword !== input.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  if (input.newPassword && input.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  }
  return errors;
}

export function validateVerifyOtp(input: VerifyOtpDTO): AuthFormError[] {
  const errors: AuthFormError[] = [];
  const email = input.email.trim();
  const otp = input.otp.trim();
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }
  if (!otp) {
    errors.push({ field: 'otp', message: 'OTP is required' });
  } else if (!OTP_REGEX.test(otp)) {
    errors.push({ field: 'otp', message: 'OTP must be a 6-digit code' });
  }
  return errors;
}
