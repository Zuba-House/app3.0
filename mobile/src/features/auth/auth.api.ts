import { API_ENDPOINTS } from '../../constants/config';
import { postData } from '../../services/api';
import { ForgotPasswordDTO, ResetPasswordDTO, VerifyOtpDTO } from './types';

interface SocialExchangeResponse {
  accessToken: string;
  refreshToken?: string;
}

export const authFeatureApi = {
  forgotPassword: (payload: ForgotPasswordDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.FORGOT_PASSWORD, payload),
  verifyForgotPasswordOtp: (payload: VerifyOtpDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, payload),
  verifyEmailOtp: (payload: VerifyOtpDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.VERIFY_EMAIL, payload),
  resetPassword: (payload: ResetPasswordDTO) =>
    postData<{ success: boolean }>(API_ENDPOINTS.RESET_PASSWORD, payload),
  exchangeSocialToken: (provider: string, payload: Record<string, string>) =>
    postData<SocialExchangeResponse>(`${API_ENDPOINTS.GOOGLE_AUTH_CODE}?provider=${provider}`, payload),
};
