/**
 * Toast notifications (non-blocking)
 */

import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  text2?: string;
  duration?: number;
}

export const showToast = (message: string, options: ToastOptions = {}) => {
  const { type = 'info', text2, duration = 3200 } = options;
  Toast.show({
    type,
    text1: message,
    text2,
    visibilityTime: duration,
    position: 'top',
  });
};

export const showError = (message: string, text2?: string) => {
  showToast(message, { type: 'error', text2 });
};

export const showSuccess = (message: string, text2?: string) => {
  showToast(message, { type: 'success', text2 });
};

export const showWarning = (message: string, text2?: string) => {
  showToast(message, { type: 'warning', text2 });
};

export const showInfo = (message: string, text2?: string) => {
  showToast(message, { type: 'info', text2 });
};
