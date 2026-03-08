'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/holidays/types';

function replaceLocale(pathname: string, locale: Locale) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return `/${locale}`;
  segments[0] = locale;
  return `/${segments.join('/')}`;
}

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <div className="inline-flex rounded-full border border-ink/10 bg-white/70 p-1 text-xs uppercase tracking-[0.2em]">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`${replaceLocale(pathname, locale)}${suffix}`}
          scroll={false}
          className={`rounded-full px-3 py-2 transition ${
            locale === currentLocale ? 'bg-ink text-foam' : 'text-ink/55 hover:text-ink'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
