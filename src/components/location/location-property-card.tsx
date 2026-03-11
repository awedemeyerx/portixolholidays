import Image from 'next/image';
import Link from 'next/link';
import { pickLocalized } from '@/lib/holidays/localize';
import type { Locale, PropertyRecord } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  property: PropertyRecord;
  labels: {
    beds: string;
    baths: string;
    guestsMax: string;
    select: string;
  };
};

export function LocationPropertyCard({ locale, property, labels }: Props) {
  const hasHeroImage = Boolean(property.heroImage);
  const hasSummary = Boolean(pickLocalized(property.summary, locale).trim());
  const href = `/${locale}/properties/${property.slugs[locale]}`;

  return (
    <article className="glass-card grid gap-5 rounded-[2rem] p-4 md:grid-cols-[1.1fr_0.9fr] md:p-5">
      <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem]">
        {hasHeroImage ? (
          <Image
            src={property.heroImage}
            alt={pickLocalized(property.title, locale)}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,116,140,0.18),transparent_58%),linear-gradient(135deg,rgba(244,227,211,0.9),rgba(255,255,255,0.98))]"
          />
        )}
      </div>

      <div className="flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-3xl leading-tight">{pickLocalized(property.title, locale)}</h3>
          </div>
          {hasSummary ? <p className="max-w-xl text-sm leading-6 text-ink/72">{pickLocalized(property.summary, locale)}</p> : null}
          <div className="flex flex-wrap gap-3 text-sm text-ink/70">
            <span>{property.bedrooms} {labels.beds}</span>
            <span>{property.bathrooms} {labels.baths}</span>
            <span>{property.maxGuests} {labels.guestsMax}</span>
          </div>
        </div>

        <div>
          <Link
            href={href}
            className="inline-flex rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-foam transition hover:bg-sea"
          >
            {labels.select}
          </Link>
        </div>
      </div>
    </article>
  );
}
