import type { Locale } from './types';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3000';

export function localizedPath(locale: Locale, path = '') {
  const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `/${locale}${clean}`;
}

export function localeAlternates(path = '') {
  return {
    languages: {
      de: `${baseUrl}/de${path}`,
      en: `${baseUrl}/en${path}`,
      es: `${baseUrl}/es${path}`,
      'x-default': `${baseUrl}/de${path}`,
    },
  };
}
