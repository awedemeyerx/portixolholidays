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
    <div className="inline-flex items-center gap-3 border-l border-[#ddd0c0] pl-4 text-[11px] uppercase tracking-[0.22em] md:pl-5">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`${replaceLocale(pathname, locale)}${suffix}`}
          scroll={false}
          className={`relative px-0.5 py-1 transition ${
            locale === currentLocale
              ? 'text-ink after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-ink after:content-[\'\']'
              : 'text-ink/45 hover:text-ink/75'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
