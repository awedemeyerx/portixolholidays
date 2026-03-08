/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { formatMoney } from '@/lib/holidays/dates';
import type { Locale, PropertySummary } from '@/lib/holidays/types';

type Props = {
  property: PropertySummary;
  locale: Locale;
  labels: {
    pricePerNight: string;
    total: string;
    deposit: string;
    select: string;
    beds: string;
    baths: string;
    guestsMax: string;
  };
  queryString: string;
};

export function PropertyCard({ property, locale, labels, queryString }: Props) {
  const href = queryString ? `/${locale}/properties/${property.slug}?${queryString}` : `/${locale}/properties/${property.slug}`;

  return (
    <article className="glass-card grid gap-5 rounded-[2rem] p-4 md:grid-cols-[1.1fr_0.9fr] md:p-5">
      <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem]">
        <img src={property.heroImage} alt={property.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-[11px] text-sea">{property.locationLabel}</p>
              <h3 className="font-serif text-3xl leading-tight">{property.title}</h3>
            </div>
            <span className="rounded-full bg-sea/10 px-3 py-1 text-xs text-sea">{property.distanceLabel}</span>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/72">{property.summary}</p>
          <div className="flex flex-wrap gap-3 text-sm text-ink/70">
            <span>{property.bedrooms} {labels.beds}</span>
            <span>{property.bathrooms} {labels.baths}</span>
            <span>{property.maxGuests} {labels.guestsMax}</span>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-white/65 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2 text-sm text-ink/72">
            <p>
              <span className="label-caps mr-2 text-[11px] text-sea">{labels.pricePerNight}</span>
              {formatMoney(property.quote.pricePerNight, property.quote.currency, locale)}
            </p>
            <p>
              <span className="label-caps mr-2 text-[11px] text-sea">{labels.total}</span>
              {formatMoney(property.quote.totalPrice, property.quote.currency, locale)}
            </p>
            <p>
              <span className="label-caps mr-2 text-[11px] text-sea">{labels.deposit}</span>
              {formatMoney(property.quote.depositAmount, property.quote.currency, locale)}
            </p>
          </div>
          <Link
            href={href}
            className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-foam transition hover:bg-sea"
          >
            {labels.select}
          </Link>
        </div>
      </div>
    </article>
  );
}
