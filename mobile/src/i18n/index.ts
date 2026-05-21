import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { STORAGE_KEYS } from '../constants/config';
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

async function loadSavedLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
    if (stored === 'en' || stored === 'fr') {
      if (stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      }
      return;
    }
    const locale = Localization.getLocales()[0];
    const deviceLang: AppLang = locale?.languageCode?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    if (deviceLang !== 'en') {
      await i18n.changeLanguage(deviceLang);
    }
  } catch {
    // Keep English
  }
}

/** Non-blocking — call once from App.tsx useEffect */
export function initLanguage(): void {
  void loadSavedLanguage();
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
