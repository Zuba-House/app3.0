/**
 * Toast Utility
 * Simple toast notifications for user feedback
 */

import { Alert, Platform } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

/**
 * Show a toast message to the user
 * On mobile, uses Alert for now. Can be enhanced with a toast library later.
 */
export const showToast = (message: string, options: ToastOptions = {}) => {
  const { type = 'info' } = options;

  // For now, use Alert for critical messages
  // In the future, can integrate react-native-toast-message or similar
  if (type === 'error') {
    Alert.alert('Error', message, [{ text: 'OK' }]);
  } else if (type === 'success') {
    Alert.alert('Success', message, [{ text: 'OK' }]);
  } else if (type === 'warning') {
    Alert.alert('Warning', message, [{ text: 'OK' }]);
  } else {
    // For info, we can use a less intrusive method
    // For now, just log it (can be enhanced later)
    console.log(`[INFO] ${message}`);
  }
};

/**
 * Show error toast
 */
export const showError = (message: string) => {
  showToast(message, { type: 'error' });
};

/**
 * Show success toast
 */
export const showSuccess = (message: string) => {
  showToast(message, { type: 'success' });
};

/**
 * Show warning toast
 */
export const showWarning = (message: string) => {
  showToast(message, { type: 'warning' });
};

/**
 * Show info toast (non-intrusive)
 */
export const showInfo = (message: string) => {
  showToast(message, { type: 'info' });
};
