import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  location: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    heroImage: string;
    propertyCount: number;
  };
  homesLabel: string;
};

export function LocationCard({ locale, location, homesLabel }: Props) {
  const hasHeroImage = Boolean(location.heroImage);
  const hasSummary = Boolean(location.summary.trim());

  return (
    <Link
      href={`/${locale}/locations/${location.slug}`}
      className="glass-card block overflow-hidden rounded-[2rem] text-left transition hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        {hasHeroImage ? (
          <Image
            src={location.heroImage}
            alt={location.title}
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/65" />
      </div>
      <div className="space-y-3 p-5">
        <p className="label-caps text-[11px] text-sea">{location.propertyCount} {homesLabel}</p>
        <h3 className="font-serif text-2xl">{location.title}</h3>
        {hasSummary ? <p className="text-sm leading-6 text-ink/70">{location.summary}</p> : null}
      </div>
    </Link>
  );
}
