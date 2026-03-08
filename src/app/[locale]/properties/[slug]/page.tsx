import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookingPanel } from '@/components/property/booking-panel';
import { formatMoney } from '@/lib/holidays/dates';
import { localizeProperty } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { localeAlternates } from '@/lib/holidays/seo';
import { getPropertyBySlug } from '@/lib/holidays/services/cms';
import { getPropertyQuoteBySlug } from '@/lib/holidays/services/quote';
import { loadMessages } from '@/lib/messages';
import { searchQuerySchema } from '@/lib/holidays/validation';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = safeLocale(rawLocale);
  const property = await getPropertyBySlug(slug, locale);
  if (!property) return {};
  const localized = localizeProperty(property, locale);

  return {
    title: localized.seoTitle,
    description: localized.seoDescription,
    alternates: localeAlternates(`/properties/${localized.slug}`),
  };
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const [{ locale: rawLocale, slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const locale = safeLocale(rawLocale);
  const property = await getPropertyBySlug(slug, locale);
  if (!property) notFound();
  const messages = await loadMessages(locale);

  const localized = localizeProperty(property, locale);
  const parsed = searchQuerySchema.safeParse({
    locale,
    checkIn: rawSearchParams.checkIn,
    checkOut: rawSearchParams.checkOut,
    guests: rawSearchParams.guests,
  });

  const rawGuests = typeof rawSearchParams.guests === 'string' ? Number(rawSearchParams.guests) : NaN;
  const selectedGuests = Number.isFinite(rawGuests) && rawGuests > 0 ? rawGuests : 2;
  const selection =
    typeof rawSearchParams.checkIn === 'string' || typeof rawSearchParams.checkOut === 'string'
      ? {
          checkIn: typeof rawSearchParams.checkIn === 'string' ? rawSearchParams.checkIn : '',
          checkOut: typeof rawSearchParams.checkOut === 'string' ? rawSearchParams.checkOut : '',
          guests: selectedGuests,
        }
      : null;

  const quote = parsed.success ? await getPropertyQuoteBySlug(slug, parsed.data) : null;
  const bookingState = typeof rawSearchParams.booking === 'string' ? rawSearchParams.booking : null;
  const hasHeroImage = Boolean(property.heroImage);
  const hasLocationLabel = Boolean(localized.locationLabel.trim());
  const hasDescription = Boolean(localized.description.trim());
  const hasAmenities = localized.amenities.length > 0;
  const hasHouseRules = localized.houseRules.length > 0;
  const hasGallery = property.gallery.length > 0;

  return (
    <div className="px-4 pb-12 pt-4 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="relative h-[420px] overflow-hidden rounded-[2rem]">
            {hasHeroImage ? (
              <Image
                src={property.heroImage}
                alt={localized.title}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 66vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,116,140,0.18),transparent_58%),linear-gradient(135deg,rgba(244,227,211,0.9),rgba(255,255,255,0.98))]"
              />
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-6 md:p-8">
            {hasLocationLabel ? <p className="label-caps text-xs text-sea">{localized.locationLabel}</p> : null}
            <h1 className="mt-3 font-serif text-5xl leading-none">{localized.title}</h1>
            {hasDescription ? <p className="mt-4 max-w-3xl text-base leading-8 text-ink/72">{localized.description}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {localized.highlights.map((highlight) => (
                <span key={highlight} className="rounded-full bg-sea/10 px-3 py-2 text-sm text-sea">
                  {highlight}
                </span>
              ))}
            </div>

            {quote ? (
              <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-white/70 p-4 md:grid-cols-4">
                <div>
                  <div className="label-caps text-[11px] text-sea">{messages.Property.perNight}</div>
                  <div className="mt-2 text-lg font-medium">{formatMoney(quote.quote.pricePerNight, quote.quote.currency, locale)}</div>
                </div>
                <div>
                  <div className="label-caps text-[11px] text-sea">{messages.Property.stayTotal}</div>
                  <div className="mt-2 text-lg font-medium">{formatMoney(quote.quote.totalPrice, quote.quote.currency, locale)}</div>
                </div>
                <div>
                  <div className="label-caps text-[11px] text-sea">{messages.Property.depositShort}</div>
                  <div className="mt-2 text-lg font-medium">{formatMoney(quote.quote.depositAmount, quote.quote.currency, locale)}</div>
                </div>
                <div>
                  <div className="label-caps text-[11px] text-sea">{messages.Property.guestsShort}</div>
                  <div className="mt-2 text-lg font-medium">{property.maxGuests}</div>
                </div>
              </div>
            ) : null}
          </div>

          {hasAmenities || hasHouseRules ? (
            <div className="grid gap-6 md:grid-cols-2">
              {hasAmenities ? (
                <article className="glass-card rounded-[2rem] p-6">
                  <p className="label-caps text-xs text-sea">{messages.Property.amenitiesTitle}</p>
                  <ul className="mt-4 grid gap-3 text-sm text-ink/72">
                    {localized.amenities.map((amenity) => (
                      <li key={amenity}>{amenity}</li>
                    ))}
                  </ul>
                </article>
              ) : null}

              {hasHouseRules ? (
                <article className="glass-card rounded-[2rem] p-6">
                  <p className="label-caps text-xs text-sea">{messages.Property.rulesTitle}</p>
                  <ul className="mt-4 grid gap-3 text-sm text-ink/72">
                    {localized.houseRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </article>
              ) : null}
            </div>
          ) : null}

          {hasGallery ? (
            <div className="grid gap-4 md:grid-cols-3">
              {property.gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={image}
                    alt={`${localized.title} ${index + 1}`}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          {bookingState === 'success' ? (
            <div className="rounded-[1.5rem] bg-sea/10 px-5 py-4 text-sm text-sea">
              {messages.Property.success}
            </div>
          ) : null}
          {bookingState === 'cancelled' ? (
            <div className="rounded-[1.5rem] bg-terracotta/10 px-5 py-4 text-sm text-terracotta">
              {messages.Property.cancelled}
            </div>
          ) : null}

          <BookingPanel
            locale={locale}
            slug={slug}
            selection={selection}
            query={parsed.success ? { checkIn: parsed.data.checkIn, checkOut: parsed.data.checkOut, guests: parsed.data.guests } : null}
            quote={quote}
          />
        </section>
      </div>
    </div>
  );
}
