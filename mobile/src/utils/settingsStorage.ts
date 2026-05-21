import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRENCY_OPTIONS,
  CurrencyCode,
  LANGUAGE_OPTIONS,
  LanguageCode,
  STORAGE_KEYS,
} from '../constants/config';

export type NotificationPreferences = {
  orderConfirmed: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  orderCancelled: boolean;
  flashSales: boolean;
  appOffers: boolean;
  newArrivals: boolean;
  securityAlerts: boolean;
  accountActivity: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orderConfirmed: true,
  orderShipped: true,
  orderDelivered: true,
  orderCancelled: true,
  flashSales: true,
  appOffers: true,
  newArrivals: true,
  securityAlerts: true,
  accountActivity: true,
};

export type PrivacySettings = {
  personalizedRecommendations: boolean;
  recentlyViewedTracking: boolean;
  analyticsUsage: boolean;
  showProfileToVendors: boolean;
  emailOrderUpdates: boolean;
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  personalizedRecommendations: true,
  recentlyViewedTracking: true,
  analyticsUsage: true,
  showProfileToVendors: true,
  emailOrderUpdates: true,
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(prefs));
}

export async function loadPrivacySettings(): Promise<PrivacySettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    if (!raw) return { ...DEFAULT_PRIVACY_SETTINGS };
    return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PRIVACY_SETTINGS };
  }
}

export async function savePrivacySettings(prefs: PrivacySettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(prefs));
}

export async function loadAppLanguage(): Promise<LanguageCode> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
  const match = LANGUAGE_OPTIONS.find((l) => l.code === raw);
  return match?.enabled ? (raw as LanguageCode) : 'en';
}

export async function saveAppLanguage(code: LanguageCode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, code);
}

export function languageLabel(code: LanguageCode): string {
  return LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? 'English';
}

export async function loadAppCurrency(): Promise<CurrencyCode> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_CURRENCY);
  if (raw === 'CAD' || raw === 'USD' || raw === 'EUR') return raw;
  return 'CAD';
}

export async function saveAppCurrency(code: CurrencyCode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.APP_CURRENCY, code);
}

export async function loadDarkMode(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
  return raw === '1';
}

export async function saveDarkMode(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled ? '1' : '0');
}
