import type { Metadata } from 'next';
import type { Locale } from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'https://www.mallorcaholi.day';

export function localizedPath(locale: Locale, path = '') {
  const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `/${locale}${clean}`;
}

export function localeAlternates(path = '') {
  return {
    canonical: `${BASE_URL}${path ? `/de${path}` : '/de'}`,
    languages: {
      de: `${BASE_URL}/de${path}`,
      en: `${BASE_URL}/en${path}`,
      es: `${BASE_URL}/es${path}`,
    },
  };
}

/** Build full page metadata with OG, Twitter, canonical, and hreflang. */
export function buildPageMeta({
  title,
  description,
  path,
  locale,
  images,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  images?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const url = `${BASE_URL}/${locale}${path}`;
  const fullTitle = `${title} | Portixol Holidays`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        de: `${BASE_URL}/de${path}`,
        en: `${BASE_URL}/en${path}`,
        es: `${BASE_URL}/es${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      type,
      url,
      siteName: 'Portixol Holidays',
      locale,
      ...(images?.length && { images }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(images?.length && { images }),
    },
  };
}
