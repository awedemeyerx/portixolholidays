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
    <div className="inline-flex rounded-[0.9rem] border border-[#ded2c2] bg-white/76 p-[3px] text-[11px] uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`${replaceLocale(pathname, locale)}${suffix}`}
          scroll={false}
          className={`rounded-[0.7rem] px-3 py-2 transition ${
            locale === currentLocale
              ? 'bg-ink text-foam shadow-[0_6px_14px_rgba(21,53,67,0.14)]'
              : 'text-ink/52 hover:bg-[#f1ebe2] hover:text-ink'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
