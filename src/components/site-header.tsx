import Link from 'next/link';
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
      <div className="glass-card mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 md:px-6">
        <Link href={`/${locale}`} className="label-caps text-xs font-semibold text-ink md:text-sm">
          {brandName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <Link href={`/${locale}/locations`} className="hover:text-ink">
            {labels.locations}
          </Link>
          <Link href={`/${locale}/#faq`} className="hover:text-ink">
            {labels.faq}
          </Link>
          <Link href={`/${locale}/#contact`} className="hover:text-ink">
            {labels.contact}
          </Link>
        </nav>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
