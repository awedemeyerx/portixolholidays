import type { Metadata } from 'next';
import { LocationCard } from '@/components/location/location-card';
import { localizeSiteSettings } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { localeAlternates, BASE_URL } from '@/lib/holidays/seo';
import { getFeaturedLocations, getSiteSettings } from '@/lib/holidays/services/cms';
import { loadMessages } from '@/lib/messages';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = safeLocale(rawLocale);
  const messages = await loadMessages(locale);
  const siteSettings = localizeSiteSettings(await getSiteSettings(), locale);

  const title = `${messages.LocationsPage.title} | ${siteSettings.brandName}`;
  const description = messages.LocationsPage.intro;
  return {
    title,
    description,
    alternates: localeAlternates('/locations'),
    openGraph: { title, description, type: 'website', url: `${BASE_URL}/${locale}/locations`, siteName: 'Portixol Holidays', locale },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LocationsOverviewPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = safeLocale(rawLocale);
  const messages = await loadMessages(locale);
  const locations = await getFeaturedLocations(locale);

  return (
    <div className="px-4 pb-12 pt-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="glass-card rounded-[2.5rem] px-6 py-10 md:px-10">
          <p className="label-caps text-xs text-sea">{messages.LocationsPage.eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl leading-none">{messages.LocationsPage.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink/72">{messages.LocationsPage.intro}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              locale={locale}
              location={location}
              homesLabel={messages.LocationsPage.homesLabel}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
