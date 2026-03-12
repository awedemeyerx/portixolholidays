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
    <header className="sticky top-0 z-30 px-4 py-3 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[1.05rem] border border-[#e7ddd0] bg-[rgba(251,247,240,0.92)] px-5 py-3 shadow-[0_12px_34px_rgba(25,48,58,0.06)] backdrop-blur-xl md:gap-8 md:px-7">
        <Link href={`/${locale}`} className="flex shrink-0 items-center">
          <BrandLogo
            alt={brandName}
            priority
            className="h-auto w-[156px] md:w-[204px]"
            sizes="(max-width: 767px) 156px, 204px"
          />
        </Link>
        <nav className="hidden items-center justify-center gap-8 border-x border-[#ded2c2] px-8 text-[12px] uppercase tracking-[0.18em] text-ink/62 md:flex">
          <Link href={`/${locale}/locations`} className="transition hover:text-sea">
            {labels.locations}
          </Link>
          <Link href={`/${locale}/#faq`} className="transition hover:text-sea">
            {labels.faq}
          </Link>
          <Link href={`/${locale}/#contact`} className="transition hover:text-sea">
            {labels.contact}
          </Link>
        </nav>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
