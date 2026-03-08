'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PropertyCard } from './property-card';
import type { AlternativeWindow, Locale, PropertySummary, SearchResponse } from '@/lib/holidays/types';

type FeaturedProperty = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  locationLabel: string;
  maxGuests: number;
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
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nextWeekKey() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export function SearchShell({ locale, hero, featuredProperties }: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuery = useMemo(() => {
    const checkIn = searchParams.get('checkIn') ?? '';
    const checkOut = searchParams.get('checkOut') ?? '';
    const guests = searchParams.get('guests') ?? '';
    return { checkIn, checkOut, guests };
  }, [searchParams]);

  useEffect(() => {
    const hasCompleteQuery = currentQuery.checkIn && currentQuery.checkOut && currentQuery.guests;
    if (!hasCompleteQuery) {
      setResponse(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setError(null);

    fetch(
      `/api/search?checkIn=${encodeURIComponent(currentQuery.checkIn)}&checkOut=${encodeURIComponent(currentQuery.checkOut)}&guests=${encodeURIComponent(currentQuery.guests)}&locale=${locale}`,
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
      });

    return () => controller.abort();
  }, [currentQuery, locale]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (currentQuery.checkIn) params.set('checkIn', currentQuery.checkIn);
    if (currentQuery.checkOut) params.set('checkOut', currentQuery.checkOut);
    if (currentQuery.guests) params.set('guests', currentQuery.guests);
    return params.toString();
  }, [currentQuery]);

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    params.set('checkIn', String(formData.get('checkIn') || ''));
    params.set('checkOut', String(formData.get('checkOut') || ''));
    params.set('guests', String(formData.get('guests') || '2'));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function onAlternativeSelect(window: AlternativeWindow) {
    const params = new URLSearchParams();
    params.set('checkIn', window.checkIn);
    params.set('checkOut', window.checkOut);
    params.set('guests', currentQuery.guests || '2');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const results = response?.results ?? [];

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
            <form action={onSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="label-caps text-[11px] text-sea">{t('arrival')}</span>
                <input
                  type="date"
                  name="checkIn"
                  required
                  defaultValue={currentQuery.checkIn || todayKey()}
                  min={todayKey()}
                  className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="label-caps text-[11px] text-sea">{t('departure')}</span>
                <input
                  type="date"
                  name="checkOut"
                  required
                  defaultValue={currentQuery.checkOut || nextWeekKey()}
                  min={todayKey()}
                  className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="label-caps text-[11px] text-sea">{t('guests')}</span>
                <select name="guests" defaultValue={currentQuery.guests || '2'} className="soft-ring rounded-2xl border-0 bg-white px-4 py-3">
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60"
                disabled={isPending}
              >
                {isPending ? t('loading') : t('submit')}
              </button>
              <p className="text-sm leading-6 text-ink/65">{hero.hint}</p>
            </form>
          </div>
        </div>
      </section>

      <section id="properties" className="px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps text-xs text-sea">{t('resultsTitle')}</p>
              <h2 className="font-serif text-4xl leading-tight">{response ? t('resultsSubtitle') : hero.ctaPrimary}</h2>
            </div>
          </div>

          {error ? <p className="rounded-3xl bg-terracotta/10 px-5 py-4 text-sm text-terracotta">{error}</p> : null}

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

          {!response ? (
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
  return (
    <Link href={`/${locale}/properties/${property.slug}`} className="glass-card block overflow-hidden rounded-[2rem] transition hover:-translate-y-1">
      <div
        className="h-64 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, transparent 10%, rgba(17, 51, 74, 0.6) 100%), url(${property.heroImage})` }}
      />
      <div className="space-y-3 p-5">
        <p className="label-caps text-[11px] text-sea">{property.locationLabel}</p>
        <h3 className="font-serif text-2xl">{property.title}</h3>
        <p className="text-sm leading-6 text-ink/70">{property.summary}</p>
        <p className="text-sm text-ink/55">
          {property.maxGuests} {t('guestsMax')}
        </p>
      </div>
    </Link>
  );
}
