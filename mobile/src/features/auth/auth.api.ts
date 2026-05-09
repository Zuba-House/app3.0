import { API_ENDPOINTS } from '../../constants/config';
import { postData } from '../../services/api';
import { ForgotPasswordDTO, RegisterDTO, ResetPasswordDTO, VerifyOtpDTO } from './types';

function shouldUseLegacyResetFallback(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return (
    message.includes('not found') ||
    message.includes('route') ||
    message.includes('404')
  );
}

export const authFeatureApi = {
  register: (payload: RegisterDTO) =>
    postData<{ verificationToken?: string }>(API_ENDPOINTS.REGISTER, payload),
  forgotPassword: (payload: ForgotPasswordDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.FORGOT_PASSWORD, {
      email: payload.email.trim().toLowerCase(),
    }),
  verifyForgotPasswordOtp: (payload: VerifyOtpDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
    }),
  verifyEmailOtp: (payload: VerifyOtpDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.VERIFY_EMAIL, {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
    }),
  resetPassword: async (payload: ResetPasswordDTO) => {
    const normalizedPayload = {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    };
    try {
      return await postData<{ success: boolean }>(API_ENDPOINTS.RESET_PASSWORD, normalizedPayload);
    } catch (error) {
      if (!shouldUseLegacyResetFallback(error)) {
        throw error;
      }
      // Compatibility fallback for older deployed backends where /reset-password fails.
      return postData<{ success: boolean }>(API_ENDPOINTS.FORGOT_PASSWORD_CHANGE_PASSWORD, {
        email: normalizedPayload.email,
        newPassword: normalizedPayload.newPassword,
        confirmPassword: normalizedPayload.confirmPassword,
      });
    }
  },
};
