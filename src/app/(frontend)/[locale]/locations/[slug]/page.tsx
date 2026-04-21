import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocationPropertyCard } from '@/components/location/location-property-card';
import { localizeLocation } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { localeAlternates } from '@/lib/holidays/seo';
import { getLocationBySlug } from '@/lib/holidays/services/cms';
import { loadMessages } from '@/lib/messages';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = safeLocale(rawLocale);
  const locationData = await getLocationBySlug(slug, locale);
  if (!locationData) return {};

  const localized = localizeLocation(locationData.location, locale);

  return {
    title: localized.title,
    description: localized.summary || localized.description,
    alternates: localeAlternates(`/locations/${localized.slug}`),
  };
}

export default async function LocationDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = safeLocale(rawLocale);
  const locationData = await getLocationBySlug(slug, locale);
  if (!locationData) notFound();

  const messages = await loadMessages(locale);
  const localized = localizeLocation(locationData.location, locale);
  const hasHeroImage = Boolean(locationData.heroImage);
  const hasDirections = Boolean(localized.directions.trim());

  return (
    <div className="px-4 pb-12 pt-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card overflow-hidden rounded-[2.5rem]">
            {hasHeroImage ? (
              <div className="relative min-h-[380px]">
                <Image
                  src={locationData.heroImage}
                  alt={localized.title}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="min-h-[380px] bg-[radial-gradient(circle_at_top,rgba(10,116,140,0.18),transparent_58%),linear-gradient(135deg,rgba(244,227,211,0.9),rgba(255,255,255,0.98))]"
              />
            )}
          </div>

          <div className="glass-card rounded-[2.5rem] px-6 py-8 md:px-8">
            <p className="label-caps text-xs text-sea">{messages.LocationsPage.detailEyebrow}</p>
            <h1 className="mt-3 font-serif text-5xl leading-none">{localized.title}</h1>
            {localized.summary ? (
              <p className="mt-4 text-base leading-8 text-ink/72">{localized.summary}</p>
            ) : null}
            {localized.description ? (
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/72">{localized.description}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-sea/10 px-3 py-2 text-sm text-sea">
                {locationData.properties.length} {messages.LocationsPage.homesLabel}
              </span>
              <Link
                href={`/${locale}/locations`}
                className="rounded-full bg-white/75 px-4 py-2 text-sm text-ink/72 transition hover:bg-white"
              >
                {messages.LocationsPage.browseAll}
              </Link>
            </div>
          </div>
        </section>

        {hasDirections ? (
          <section className="glass-card rounded-[2rem] px-6 py-8 md:px-8">
            <p className="label-caps text-xs text-sea">{messages.LocationsPage.directionsTitle}</p>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/72">{localized.directions}</p>
          </section>
        ) : null}

        <section className="space-y-5">
          <div>
            <p className="label-caps text-xs text-sea">{messages.LocationsPage.eyebrow}</p>
            <h2 className="mt-3 font-serif text-4xl">{messages.LocationsPage.homesTitle}</h2>
          </div>

          <div className="grid gap-6">
            {locationData.properties.map((property) => (
              <LocationPropertyCard
                key={property.id}
                locale={locale}
                property={property}
                labels={{
                  guestsMax: messages.Search.guestsMax,
                  select: messages.LocationsPage.viewProperty,
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
