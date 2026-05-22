/**
 * Device locale without expo-localization native module (works in older dev builds).
 * Uses Intl — available in Hermes. When you rebuild with expo-localization linked,
 * behavior stays the same.
 */

export type DeviceLocale = {
  languageCode?: string | null;
  regionCode?: string | null;
};

function parseIntlLocale(): DeviceLocale | null {
  if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
    return null;
  }

  const tag = Intl.DateTimeFormat().resolvedOptions().locale || '';
  if (!tag) return null;

  const normalized = tag.replace(/_/g, '-');
  const parts = normalized.split('-').filter(Boolean);
  if (!parts.length) return null;

  const languageCode = parts[0].toLowerCase();
  let regionCode: string | undefined;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (/^[a-z]{2}$/i.test(part) && part.length === 2) {
      regionCode = part.toUpperCase();
      break;
    }
    if (/^[0-9]{3}$/.test(part)) {
      continue;
    }
  }

  return { languageCode, regionCode: regionCode ?? null };
}

export function getDeviceLocale(): DeviceLocale | null {
  try {
    return parseIntlLocale();
  } catch {
    return null;
  }
}

export function getDeviceLanguageCode(): string | undefined {
  return getDeviceLocale()?.languageCode?.toLowerCase() ?? undefined;
}

export function getDeviceRegionCode(): string | undefined {
  return getDeviceLocale()?.regionCode?.toUpperCase() ?? undefined;
}
