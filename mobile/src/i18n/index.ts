import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { getDeviceLocale } from '../utils/safeLocalization';
import { saveAppLanguage } from '../utils/settingsStorage';
import en from './locales/en.json';
import fr from './locales/fr.json';

export type AppLang = 'en' | 'fr';

// Init at module load (non-blocking) — app renders immediately with English
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  react: { useSuspense: false },
});

/** Fire-and-forget — never block app startup. */
export function loadSavedLanguage(): void {
  void (async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
      if (stored === 'en' || stored === 'fr') {
        if (stored !== i18n.language) {
          void i18n.changeLanguage(stored).catch(() => {});
        }
        return;
      }
      const locale = getDeviceLocale();
      const deviceLang: AppLang = locale?.languageCode?.toLowerCase().startsWith('fr')
        ? 'fr'
        : 'en';
      if (deviceLang !== 'en') {
        void i18n.changeLanguage(deviceLang).catch(() => {});
      }
    } catch {
      // Keep English
    }
  })();
}

/** @deprecated Use loadSavedLanguage — kept for compatibility */
export function initLanguage(): void {
  loadSavedLanguage();
}

export async function changeLanguage(lang: AppLang): Promise<void> {
  try {
    await saveAppLanguage(lang);
    await i18n.changeLanguage(lang);
  } catch (err) {
    console.error('[i18n] changeLanguage error:', err);
  }
}

export function getDeleteConfirmWord(): string {
  return i18n.t('deleteAccount.confirmWord');
}

export default i18n;
