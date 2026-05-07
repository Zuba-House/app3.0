export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

export interface AuthFormError {
  field: string;
  message: string;
}
