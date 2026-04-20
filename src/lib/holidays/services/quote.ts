import { fetchBeds24Availability, fetchBeds24Offers, fallbackOffer, isBeds24Configured } from '../beds24/client';
import { diffNights } from '../dates';
import { localizeProperty } from '../localize';
import { getPropertyBySlug } from './cms';
import { getInventorySnapshot, quoteFromInventorySnapshot } from './inventory-snapshots';
import { getBeds24OfferMap, toPriceBreakdownFromOffer } from './offers';
import { applyVoucherToBreakdown, validateVoucher, type VoucherValidationError } from './vouchers';
import type { Beds24Offer, PropertyQuote, SearchQuery } from '../types';

export type QuoteResult =
  | { ok: true; quote: PropertyQuote; voucherError?: VoucherValidationError }
  | { ok: false; reason: 'not_found' | 'min_stay' | 'unavailable'; minStay?: number; nights?: number };

function toLiveQuote(
  propertyId: string,
  localeData: ReturnType<typeof localizeProperty>,
  locale: SearchQuery['locale'],
  quote: PropertyQuote['quote'],
): PropertyQuote {
  return {
    propertyId,
    slug: localeData.slug,
    title: localeData.title,
    summary: localeData.summary,
    description: localeData.description,
    heroImage: '',
    gallery: [],
    locationLabel: localeData.locationLabel,
    distanceLabel: localeData.distanceLabel,
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 0,
    highlights: localeData.highlights,
    amenities: localeData.amenities,
    houseRules: localeData.houseRules,
    cancellationSummary: localeData.cancellationSummary,
    quote,
    available: quote.totalPrice > 0,
    locale,
  };
}

export async function getPropertyQuoteBySlug(
  slug: string,
  query: SearchQuery,
  options?: { forceLive?: boolean; voucherCode?: string },
): Promise<QuoteResult> {
  const property = await getPropertyBySlug(slug, query.locale);
  if (!property) return { ok: false, reason: 'not_found' };
  if (query.guests > property.maxGuests) return { ok: false, reason: 'not_found' };

  const localized = localizeProperty(property, query.locale);
  const nights = diffNights(query.checkIn, query.checkOut);
  if (nights <= 0) return { ok: false, reason: 'not_found' };

  if (nights < property.pricing.minStay) {
    return { ok: false, reason: 'min_stay', minStay: property.pricing.minStay, nights };
  }

  if (options?.forceLive) {
    let offer: Beds24Offer = fallbackOffer(property, query);

    if (isBeds24Configured()) {
      try {
        const stillAvailable = await fetchBeds24Availability(query, property.beds24RoomId);
        if (!stillAvailable) {
          offer = { ...offer, available: false };
        } else {
          const [liveOffer] = await fetchBeds24Offers(query, [property.beds24RoomId]);
          if (liveOffer) offer = liveOffer;
        }
      } catch {
        offer = fallbackOffer(property, query);
      }
    }

    const liveBreakdown = toPriceBreakdownFromOffer(property, query, offer);
    const liveApplied = await maybeApplyVoucher(liveBreakdown, {
      code: options?.voucherCode,
      propertyId: property.id,
      depositRate: property.pricing.depositRate,
      nights,
      checkIn: query.checkIn,
    });

    const liveQuote = toLiveQuote(property.id, localized, query.locale, liveApplied.breakdown);
    liveQuote.heroImage = property.heroImage;
    liveQuote.gallery = property.gallery;
    liveQuote.bedrooms = property.bedrooms;
    liveQuote.bathrooms = property.bathrooms;
    liveQuote.maxGuests = property.maxGuests;
    liveQuote.available = offer.available;

    return { ok: true, quote: liveQuote, voucherError: liveApplied.voucherError };
  }

  const snapshot = await getInventorySnapshot(property);
  const priced = quoteFromInventorySnapshot(property, query, snapshot);
  if (!priced) return { ok: false, reason: 'unavailable' };

  const cachedOffers = await getBeds24OfferMap(query, [property]);
  const offer = cachedOffers.get(property.beds24RoomId);
  const baseBreakdown = offer?.available
    ? toPriceBreakdownFromOffer(property, query, offer)
    : priced.quote;

  const applied = await maybeApplyVoucher(baseBreakdown, {
    code: options?.voucherCode,
    propertyId: property.id,
    depositRate: property.pricing.depositRate,
    nights,
    checkIn: query.checkIn,
  });

  return {
    ok: true,
    voucherError: applied.voucherError,
    quote: {
      propertyId: property.id,
      slug: localized.slug,
      title: localized.title,
      summary: localized.summary,
      description: localized.description,
      heroImage: property.heroImage,
      gallery: property.gallery,
      locationLabel: localized.locationLabel,
      distanceLabel: localized.distanceLabel,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      highlights: localized.highlights,
      amenities: localized.amenities,
      houseRules: localized.houseRules,
      cancellationSummary: localized.cancellationSummary,
      quote: applied.breakdown,
      available: true,
      locale: query.locale,
    } satisfies PropertyQuote,
  };
}

type ApplyVoucherContext = {
  code?: string;
  propertyId: string;
  depositRate: number;
  nights: number;
  checkIn: string;
};

async function maybeApplyVoucher(
  breakdown: PropertyQuote['quote'],
  ctx: ApplyVoucherContext,
): Promise<{ breakdown: PropertyQuote['quote']; voucherError?: VoucherValidationError }> {
  const code = ctx.code?.trim();
  if (!code) return { breakdown };

  const validation = await validateVoucher({
    code,
    propertyId: ctx.propertyId,
    nights: ctx.nights,
    subtotal: breakdown.subtotal,
    checkIn: ctx.checkIn,
  });

  if (!validation.ok) {
    return { breakdown, voucherError: validation.reason };
  }

  const { breakdown: updated } = applyVoucherToBreakdown(breakdown, validation.voucher, ctx.depositRate);
  return { breakdown: updated };
}
