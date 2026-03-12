import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import type { Locale } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  legalLabels: {
    imprint: string;
    privacy: string;
    terms: string;
  };
};

export function SiteFooter({ locale, brandName, supportEmail, supportPhone, legalLabels }: Props) {
  return (
    <footer id="contact" className="px-4 pb-10 pt-20 md:px-8">
      <div className="glass-card mx-auto grid max-w-7xl gap-8 rounded-[2rem] px-6 py-8 md:grid-cols-[1.4fr_1fr] md:px-10">
        <div className="space-y-4">
          <Link href={`/${locale}`} className="inline-flex items-center">
            <BrandLogo
              alt={brandName}
              className="h-auto w-[210px] md:w-[260px]"
              sizes="(max-width: 767px) 210px, 260px"
            />
          </Link>
          <div className="text-sm leading-7 text-ink/70">
            <p>{supportEmail}</p>
            <p>{supportPhone}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-ink/70">
          <Link href={`/${locale}/legal/imprint`} className="hover:text-ink">
            {legalLabels.imprint}
          </Link>
          <Link href={`/${locale}/legal/privacy`} className="hover:text-ink">
            {legalLabels.privacy}
          </Link>
          <Link href={`/${locale}/legal/terms`} className="hover:text-ink">
            {legalLabels.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
