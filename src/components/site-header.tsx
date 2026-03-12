import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { LocaleSwitcher } from './locale-switcher';
import type { Locale } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  brandName: string;
  labels: {
    locations: string;
    faq: string;
    contact: string;
  };
};

export function SiteHeader({ locale, brandName, labels }: Props) {
  return (
    <header className="sticky top-0 z-30 px-4 py-2 md:px-8 md:py-3">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[0.9rem] border border-[#e4d8ca] bg-[rgba(252,248,242,0.94)] px-4 py-3 shadow-[0_10px_28px_rgba(25,48,58,0.05)] backdrop-blur-xl md:gap-8 md:px-6">
        <Link href={`/${locale}`} className="flex shrink-0 items-center">
          <BrandLogo
            alt={brandName}
            priority
            className="h-auto w-[152px] md:w-[194px]"
            sizes="(max-width: 767px) 152px, 194px"
          />
        </Link>
        <nav className="hidden items-center justify-center gap-5 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/56 md:flex">
          <Link href={`/${locale}/locations`} className="transition hover:text-sea">
            {labels.locations}
          </Link>
          <span aria-hidden="true" className="h-3 w-px bg-[#d9ccbb]" />
          <Link href={`/${locale}/#faq`} className="transition hover:text-sea">
            {labels.faq}
          </Link>
          <span aria-hidden="true" className="h-3 w-px bg-[#d9ccbb]" />
          <Link href={`/${locale}/#contact`} className="transition hover:text-sea">
            {labels.contact}
          </Link>
        </nav>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
