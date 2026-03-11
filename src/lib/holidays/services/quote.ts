import { fetchBeds24Availability, fetchBeds24Offers, fallbackOffer, isBeds24Configured } from '../beds24/client';
import { diffNights } from '../dates';
import { localizeProperty } from '../localize';
import { getPropertyBySlug } from './cms';
import { getInventorySnapshot, quoteFromInventorySnapshot } from './inventory-snapshots';
import { getBeds24OfferMap, toPriceBreakdownFromOffer } from './offers';
import type { Beds24Offer, PropertyQuote, SearchQuery } from '../types';

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
  options?: { forceLive?: boolean },
) {
  const property = await getPropertyBySlug(slug, query.locale);
  if (!property) return null;
  if (query.guests > property.maxGuests) return null;

  const localized = localizeProperty(property, query.locale);
  const nights = diffNights(query.checkIn, query.checkOut);
  if (nights <= 0) return null;

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

    const liveQuote = toLiveQuote(
      property.id,
      localized,
      query.locale,
      toPriceBreakdownFromOffer(property, query, offer),
    );
    liveQuote.heroImage = property.heroImage;
    liveQuote.gallery = property.gallery;
    liveQuote.bedrooms = property.bedrooms;
    liveQuote.bathrooms = property.bathrooms;
    liveQuote.maxGuests = property.maxGuests;
    liveQuote.available = offer.available;

    return liveQuote;
  }

  const snapshot = await getInventorySnapshot(property);
  const priced = quoteFromInventorySnapshot(property, query, snapshot);
  if (!priced) return null;

  const cachedOffers = await getBeds24OfferMap(query, [property]);
  const offer = cachedOffers.get(property.beds24RoomId);
  const quoteBreakdown = offer?.available
    ? toPriceBreakdownFromOffer(property, query, offer)
    : priced.quote;

  return {
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
    quote: quoteBreakdown,
    available: true,
    locale: query.locale,
  } satisfies PropertyQuote;
}
