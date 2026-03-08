import { LOCALES, type Locale } from './types';

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function safeLocale(value: string | undefined): Locale {
  if (value && isLocale(value)) return value;
  return 'de';
}

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'de';
  const normalized = acceptLanguage.toLowerCase();
  if (normalized.includes('es')) return 'es';
  if (normalized.includes('en')) return 'en';
  return 'de';
}
