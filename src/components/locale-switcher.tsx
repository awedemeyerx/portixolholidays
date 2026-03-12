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
    <div className="inline-flex rounded-[1rem] border border-ink/10 bg-white/72 p-1 text-xs uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`${replaceLocale(pathname, locale)}${suffix}`}
          scroll={false}
          className={`rounded-[0.8rem] px-3 py-2 transition ${
            locale === currentLocale ? 'bg-ink text-foam shadow-[0_8px_18px_rgba(21,53,67,0.18)]' : 'text-ink/55 hover:bg-sea/6 hover:text-ink'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
