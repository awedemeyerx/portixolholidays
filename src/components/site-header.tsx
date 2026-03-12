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
    <header className="sticky top-0 z-30 px-4 py-4 md:px-8">
      <div className="glass-card mx-auto flex max-w-7xl items-center justify-between rounded-[1.35rem] border border-white/45 px-5 py-4 shadow-[0_18px_48px_rgba(21,53,67,0.08)] md:px-7">
        <Link href={`/${locale}`} className="flex shrink-0 items-center">
          <BrandLogo
            alt={brandName}
            priority
            className="h-auto w-[168px] md:w-[220px]"
            sizes="(max-width: 767px) 168px, 220px"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink/72 md:flex">
          <Link href={`/${locale}/locations`} className="transition hover:text-ink">
            {labels.locations}
          </Link>
          <Link href={`/${locale}/#faq`} className="transition hover:text-ink">
            {labels.faq}
          </Link>
          <Link href={`/${locale}/#contact`} className="transition hover:text-ink">
            {labels.contact}
          </Link>
        </nav>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
