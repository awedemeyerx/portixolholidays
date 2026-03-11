'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { diffNights } from '@/lib/holidays/dates';
import { LocationCard } from '@/components/location/location-card';
import { PropertyCard } from './property-card';
import { StaySearchForm } from './stay-search-form';
import type { AlternativeWindow, CalendarSnapshot, Locale, PropertySummary, SearchResponse } from '@/lib/holidays/types';

type FeaturedProperty = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  locationLabel: string;
  maxGuests: number;
};

type FeaturedLocation = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  propertyCount: number;
};

type Props = {
  locale: Locale;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    hint: string;
    emptyTitle: string;
    emptyBody: string;
  };
  featuredProperties: FeaturedProperty[];
  featuredLocations: FeaturedLocation[];
  locationOptions: Array<{ value: string; label: string; propertyCount?: number }>;
  searchCalendars: CalendarSnapshot[];
};

function buildSearchQueryString(input: {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  locale?: string;
  locations?: string[];
}) {
  const params = new URLSearchParams();
  if (input.checkIn) params.set('checkIn', input.checkIn);
  if (input.checkOut) params.set('checkOut', input.checkOut);
  if (input.guests) params.set('guests', input.guests);
  if (input.locale) params.set('locale', input.locale);
  (input.locations ?? []).forEach((location) => {
    if (location) params.append('location', location);
  });
  return params.toString();
}

export function SearchShell({
  locale,
  hero,
  featuredProperties,
  featuredLocations,
  locationOptions,
  searchCalendars,
}: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingResults, setIsFetchingResults] = useState(false);

  const currentQuery = useMemo(() => {
    const checkIn = searchParams.get('checkIn') ?? '';
    const checkOut = searchParams.get('checkOut') ?? '';
    const guests = searchParams.get('guests') ?? '';
    const locations = searchParams.getAll('location');
    return { checkIn, checkOut, guests, locations };
  }, [searchParams]);
  const selectedGuests = useMemo(() => {
    const guests = Number(currentQuery.guests);
    return Number.isFinite(guests) && guests > 0 ? guests : 2;
  }, [currentQuery.guests]);
  const hasCompleteQuery = Boolean(currentQuery.checkIn && currentQuery.checkOut && currentQuery.guests);
  const hasInvalidRange = Boolean(
    currentQuery.checkIn && currentQuery.checkOut && diffNights(currentQuery.checkIn, currentQuery.checkOut) <= 0,
  );

  useEffect(() => {
    if (!hasCompleteQuery || hasInvalidRange) {
      setResponse(null);
      setError(null);
      setIsFetchingResults(false);
      return;
    }

    const controller = new AbortController();
    setError(null);
    setIsFetchingResults(true);

    fetch(
      `/api/search?${buildSearchQueryString({
        checkIn: currentQuery.checkIn,
        checkOut: currentQuery.checkOut,
        guests: currentQuery.guests,
        locale,
        locations: currentQuery.locations,
      })}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(String(body.error ?? 'Search failed'));
        }
        return res.json();
      })
      .then((data: SearchResponse) => {
        setResponse(data);
      })
      .catch((requestError) => {
        if ((requestError as Error).name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Search failed');
      })
      .finally(() => {
        setIsFetchingResults(false);
      });

    return () => controller.abort();
  }, [currentQuery, hasCompleteQuery, hasInvalidRange, locale]);

  const queryString = useMemo(() => {
    return buildSearchQueryString({
      checkIn: currentQuery.checkIn,
      checkOut: currentQuery.checkOut,
      guests: currentQuery.guests,
      locations: currentQuery.locations,
    });
  }, [currentQuery]);

  function onSubmit(nextQuery: { checkIn: string; checkOut: string; guests: number; locations: string[] }) {
    const params = buildSearchQueryString({
      checkIn: nextQuery.checkIn,
      checkOut: nextQuery.checkOut,
      guests: String(nextQuery.guests),
      locations: nextQuery.locations,
    });
    startTransition(() => {
      router.replace(`${pathname}?${params}`, { scroll: false });
    });
  }

  function onClear() {
    const params = buildSearchQueryString({
      locations: currentQuery.locations,
    });
    startTransition(() => {
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  }

  function onAlternativeSelect(window: AlternativeWindow) {
    const params = buildSearchQueryString({
      checkIn: window.checkIn,
      checkOut: window.checkOut,
      guests: String(selectedGuests),
      locations: currentQuery.locations,
    });
    startTransition(() => {
      router.replace(`${pathname}?${params}`, { scroll: false });
    });
  }

  const results = response?.results ?? [];
  const showFeatured = !response && !hasCompleteQuery;
  const showLocations = showFeatured && featuredLocations.length > 0;
  const showLoadingPanel = hasCompleteQuery && !response && isFetchingResults;

  return (
    <div className="space-y-10">
      <section className="px-4 pb-8 pt-6 md:px-8 md:pt-10">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] bg-hero-glow px-2 py-4 md:grid-cols-[1.1fr_0.9fr] md:px-4">
          <div className="hero-rhythm px-2 py-4 md:px-6 md:py-10">
            <p className="label-caps text-xs text-sea">{hero.eyebrow}</p>
            <h1 className="section-title max-w-3xl">{hero.title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/72">{hero.subtitle}</p>
          </div>

          <div className="glass-card rounded-[2rem] p-5 md:p-7">
            <StaySearchForm
              locale={locale}
              initialCheckIn={currentQuery.checkIn}
              initialCheckOut={currentQuery.checkOut}
              initialGuests={selectedGuests}
              initialLocations={currentQuery.locations}
              submitLabel={t('submit')}
              loadingLabel={t('loading')}
              helperText={hero.hint}
              isPending={isFetchingResults}
              calendars={searchCalendars}
              locationOptions={locationOptions}
              onSubmit={onSubmit}
              onClear={onClear}
              labels={{
                arrival: t('arrival'),
                departure: t('departure'),
                guests: t('guests'),
                locations: t('locations'),
                allLocations: t('allLocations'),
                selectArrival: t('selectArrival'),
                selectDeparture: t('selectDeparture'),
                invalidRange: t('invalidRange'),
                resetDates: t('resetDates'),
                nights: t('nights'),
              }}
            />
          </div>
        </div>
      </section>

      <section id="locations" className="px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps text-xs text-sea">{showLocations ? t('locationsSectionLabel') : t('resultsTitle')}</p>
              <h2 className="font-serif text-4xl leading-tight">
                {showLocations ? t('locationsSectionTitle') : response || hasCompleteQuery ? t('resultsSubtitle') : hero.ctaPrimary}
              </h2>
            </div>
          </div>

          {error ? <p className="rounded-3xl bg-terracotta/10 px-5 py-4 text-sm text-terracotta">{error}</p> : null}

          {response && isFetchingResults ? (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-sea/12 bg-white/70 px-4 py-3 text-sm text-ink/72">
              <span className="loading-wheel" aria-hidden="true" />
              <span>{response ? t('rechecking') : t('checking')}</span>
            </div>
          ) : null}

          {showLoadingPanel ? (
            <div className="glass-card rounded-[2rem] px-6 py-10 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                <span className="loading-wheel loading-wheel-large" aria-hidden="true" />
                <h3 className="font-serif text-3xl">{t('checkingTitle')}</h3>
                <p className="text-sm leading-7 text-ink/68">{t('checkingBody')}</p>
              </div>
            </div>
          ) : null}

          {response && results.length > 0 ? (
            <div className="grid gap-6">
              {results.map((property: PropertySummary) => (
                <PropertyCard
                  key={property.propertyId}
                  property={property}
                  locale={locale}
                  queryString={queryString}
                  labels={{
                    pricePerNight: t('pricePerNight'),
                    total: t('total'),
                    deposit: t('deposit'),
                    select: t('select'),
                    beds: t('beds'),
                    baths: t('baths'),
                    guestsMax: t('guestsMax'),
                  }}
                />
              ))}
            </div>
          ) : null}

          {response && results.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-6 md:p-8">
              <div className="space-y-3">
                <p className="label-caps text-xs text-terracotta">{t('empty')}</p>
                <h3 className="font-serif text-3xl">{hero.emptyTitle}</h3>
                <p className="max-w-2xl text-sm leading-7 text-ink/70">{hero.emptyBody}</p>
              </div>
              {response.alternatives.length > 0 ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {response.alternatives.map((window) => (
                    <button
                      key={`${window.checkIn}-${window.checkOut}`}
                      type="button"
                      onClick={() => onAlternativeSelect(window)}
                      className="rounded-[1.5rem] border border-ink/10 bg-white px-4 py-4 text-left transition hover:border-sea/40 hover:bg-sea/5"
                    >
                      <div className="label-caps text-[11px] text-sea">{t('alternativeTitle')}</div>
                      <div className="mt-2 text-lg font-medium text-ink">{`${window.checkIn} -> ${window.checkOut}`}</div>
                      <div className="mt-1 text-sm text-ink/65">
                        {window.availableCount} {t('availableCount')}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {showLocations ? (
            <div className="grid gap-5 md:grid-cols-2">
              {featuredLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  locale={locale}
                  location={location}
                  homesLabel={t('homesInLocation')}
                />
              ))}
            </div>
          ) : null}

          {showFeatured && !showLocations ? (
            <div className="grid gap-5 md:grid-cols-3">
              {featuredProperties.map((property) => (
                <LinkCard key={property.id} locale={locale} property={property} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function LinkCard({ locale, property }: { locale: Locale; property: FeaturedProperty }) {
  const t = useTranslations('Search');
  const hasHeroImage = Boolean(property.heroImage);
  const hasLocationLabel = Boolean(property.locationLabel.trim());
  const hasSummary = Boolean(property.summary.trim());
  return (
    <Link href={`/${locale}/properties/${property.slug}`} className="glass-card block overflow-hidden rounded-[2rem] transition hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        {hasHeroImage ? (
          <Image
            src={property.heroImage}
            alt={property.title}
            fill
            sizes="(max-width: 767px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,116,140,0.18),transparent_58%),linear-gradient(135deg,rgba(244,227,211,0.9),rgba(255,255,255,0.98))]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/70" />
      </div>
      <div className="space-y-3 p-5">
        {hasLocationLabel ? <p className="label-caps text-[11px] text-sea">{property.locationLabel}</p> : null}
        <h3 className="font-serif text-2xl">{property.title}</h3>
        {hasSummary ? <p className="text-sm leading-6 text-ink/70">{property.summary}</p> : null}
        <p className="text-sm text-ink/55">
          {property.maxGuests} {t('guestsMax')}
        </p>
      </div>
    </Link>
  );
}
