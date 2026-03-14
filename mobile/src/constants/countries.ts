/**
 * International country list for address form and phone input.
 * Includes country name, ISO code, and calling code for libphonenumber-style validation.
 */

export interface CountryOption {
  name: string;
  code: string;
  callingCode: string;
}

/** Countries supported in address form (Canada, USA, Rwanda, UK, EU, and international). */
export const COUNTRIES: CountryOption[] = [
  { name: 'Canada', code: 'CA', callingCode: '1' },
  { name: 'United States', code: 'US', callingCode: '1' },
  { name: 'Rwanda', code: 'RW', callingCode: '250' },
  { name: 'United Kingdom', code: 'GB', callingCode: '44' },
  { name: 'France', code: 'FR', callingCode: '33' },
  { name: 'Germany', code: 'DE', callingCode: '49' },
  { name: 'Italy', code: 'IT', callingCode: '39' },
  { name: 'Spain', code: 'ES', callingCode: '34' },
  { name: 'Belgium', code: 'BE', callingCode: '32' },
  { name: 'Netherlands', code: 'NL', callingCode: '31' },
  { name: 'Portugal', code: 'PT', callingCode: '351' },
  { name: 'Ireland', code: 'IE', callingCode: '353' },
  { name: 'Austria', code: 'AT', callingCode: '43' },
  { name: 'Switzerland', code: 'CH', callingCode: '41' },
  { name: 'Poland', code: 'PL', callingCode: '48' },
  { name: 'Sweden', code: 'SE', callingCode: '46' },
  { name: 'Norway', code: 'NO', callingCode: '47' },
  { name: 'Denmark', code: 'DK', callingCode: '45' },
  { name: 'Finland', code: 'FI', callingCode: '358' },
  { name: 'Australia', code: 'AU', callingCode: '61' },
  { name: 'New Zealand', code: 'NZ', callingCode: '64' },
  { name: 'Japan', code: 'JP', callingCode: '81' },
  { name: 'South Korea', code: 'KR', callingCode: '82' },
  { name: 'India', code: 'IN', callingCode: '91' },
  { name: 'China', code: 'CN', callingCode: '86' },
  { name: 'Brazil', code: 'BR', callingCode: '55' },
  { name: 'Mexico', code: 'MX', callingCode: '52' },
  { name: 'South Africa', code: 'ZA', callingCode: '27' },
  { name: 'Nigeria', code: 'NG', callingCode: '234' },
  { name: 'Kenya', code: 'KE', callingCode: '254' },
  { name: 'Uganda', code: 'UG', callingCode: '256' },
  { name: 'Tanzania', code: 'TZ', callingCode: '255' },
  { name: 'Ghana', code: 'GH', callingCode: '233' },
  { name: 'Egypt', code: 'EG', callingCode: '20' },
  { name: 'Morocco', code: 'MA', callingCode: '212' },
  { name: 'Saudi Arabia', code: 'SA', callingCode: '966' },
  { name: 'United Arab Emirates', code: 'AE', callingCode: '971' },
  { name: 'Israel', code: 'IL', callingCode: '972' },
  { name: 'Turkey', code: 'TR', callingCode: '90' },
  { name: 'Russia', code: 'RU', callingCode: '7' },
  { name: 'Ukraine', code: 'UA', callingCode: '380' },
  { name: 'Czech Republic', code: 'CZ', callingCode: '420' },
  { name: 'Romania', code: 'RO', callingCode: '40' },
  { name: 'Hungary', code: 'HU', callingCode: '36' },
  { name: 'Greece', code: 'GR', callingCode: '30' },
  { name: 'Argentina', code: 'AR', callingCode: '54' },
  { name: 'Chile', code: 'CL', callingCode: '56' },
  { name: 'Colombia', code: 'CO', callingCode: '57' },
  { name: 'Peru', code: 'PE', callingCode: '51' },
  { name: 'Pakistan', code: 'PK', callingCode: '92' },
  { name: 'Bangladesh', code: 'BD', callingCode: '880' },
  { name: 'Philippines', code: 'PH', callingCode: '63' },
  { name: 'Indonesia', code: 'ID', callingCode: '62' },
  { name: 'Malaysia', code: 'MY', callingCode: '60' },
  { name: 'Singapore', code: 'SG', callingCode: '65' },
  { name: 'Thailand', code: 'TH', callingCode: '66' },
  { name: 'Vietnam', code: 'VN', callingCode: '84' },
  { name: 'Hong Kong', code: 'HK', callingCode: '852' },
  { name: 'Taiwan', code: 'TW', callingCode: '886' },
  { name: 'Lebanon', code: 'LB', callingCode: '961' },
  { name: 'Jordan', code: 'JO', callingCode: '962' },
  { name: 'Qatar', code: 'QA', callingCode: '974' },
  { name: 'Kuwait', code: 'KW', callingCode: '965' },
  { name: 'Bahrain', code: 'BH', callingCode: '973' },
  { name: 'Oman', code: 'OM', callingCode: '968' },
  { name: 'Iceland', code: 'IS', callingCode: '354' },
  { name: 'Luxembourg', code: 'LU', callingCode: '352' },
  { name: 'Malta', code: 'MT', callingCode: '356' },
  { name: 'Cyprus', code: 'CY', callingCode: '357' },
  { name: 'Estonia', code: 'EE', callingCode: '372' },
  { name: 'Latvia', code: 'LV', callingCode: '371' },
  { name: 'Lithuania', code: 'LT', callingCode: '370' },
  { name: 'Slovakia', code: 'SK', callingCode: '421' },
  { name: 'Slovenia', code: 'SI', callingCode: '386' },
  { name: 'Croatia', code: 'HR', callingCode: '385' },
  { name: 'Bulgaria', code: 'BG', callingCode: '359' },
  { name: 'Serbia', code: 'RS', callingCode: '381' },
  { name: 'Algeria', code: 'DZ', callingCode: '213' },
  { name: 'Tunisia', code: 'TN', callingCode: '216' },
  { name: 'Ethiopia', code: 'ET', callingCode: '251' },
  { name: 'Senegal', code: 'SN', callingCode: '221' },
  { name: 'Ivory Coast', code: 'CI', callingCode: '225' },
  { name: 'Cameroon', code: 'CM', callingCode: '237' },
  { name: 'Zimbabwe', code: 'ZW', callingCode: '263' },
  { name: 'Zambia', code: 'ZM', callingCode: '260' },
  { name: 'Botswana', code: 'BW', callingCode: '267' },
  { name: 'Mauritius', code: 'MU', callingCode: '230' },
  { name: 'Other', code: 'XX', callingCode: '' },
];

const CODE_TO_COUNTRY = new Map(COUNTRIES.map((c) => [c.code, c]));
const CODE_TO_CALLING = new Map(COUNTRIES.map((c) => [c.code, c.callingCode]));

export function getCountryByCode(code: string): CountryOption | undefined {
  return CODE_TO_COUNTRY.get((code || '').toUpperCase());
}

export function getCallingCode(countryCode: string): string {
  return CODE_TO_CALLING.get((countryCode || '').toUpperCase()) || '';
}

/** Emoji flag from ISO 3166-1 alpha-2 (e.g. CA -> 🇨🇦). */
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2 || code === 'XX') return '🌐';
  const a = 0x1f1e6;
  const b = code.toUpperCase().charCodeAt(0) - 65 + a;
  const c = code.toUpperCase().charCodeAt(1) - 65 + a;
  return String.fromCodePoint(b, c);
}
