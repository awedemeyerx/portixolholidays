import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { CookieBanner } from '@/components/cookie-banner';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { safeLocale } from '@/lib/holidays/locale';
import { localeAlternates, BASE_URL } from '@/lib/holidays/seo';
import type { Locale } from '@/lib/holidays/types';
import { loadMessages } from '@/lib/messages';
import { getSiteSettings } from '@/lib/holidays/services/cms';
import { localizeSiteSettings } from '@/lib/holidays/localize';

export function generateStaticParams() {
  return [{ locale: 'de' }, { locale: 'en' }, { locale: 'es' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = safeLocale(rawLocale);
  const settings = localizeSiteSettings(await getSiteSettings(), locale);
  const description = settings.heroSubtitle;
  return {
    title: settings.brandName,
    description,
    alternates: localeAlternates(),
    openGraph: {
      title: settings.brandName,
      description,
      type: 'website',
      url: `${BASE_URL}/${locale}`,
      siteName: 'Portixol Holidays',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.brandName,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = safeLocale(rawLocale) as Locale;
  if (!['de', 'en', 'es'].includes(locale)) {
    notFound();
  }

  const messages = await loadMessages(locale);
  const settings = localizeSiteSettings(await getSiteSettings(), locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen">
        <SiteHeader
          locale={locale}
          brandName={settings.brandName}
          labels={{
            locations: messages.Header.locations,
            faq: messages.Header.faq,
            contact: messages.Header.contact,
          }}
        />
        <main>{children}</main>
        <SiteFooter
          locale={locale}
          brandName={settings.brandName}
          supportEmail={settings.supportEmail}
          supportPhone={settings.supportPhone}
          legalLabels={{
            imprint: settings.legalLinks.imprint,
            privacy: settings.legalLinks.privacy,
            terms: settings.legalLinks.terms,
          }}
        />
        <CookieBanner />
      </div>
    </NextIntlClientProvider>
  );
}
