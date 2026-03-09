import { fetchBeds24Availability, fetchBeds24Calendar, fetchBeds24Offers, fallbackOffer, isBeds24Configured } from '../beds24/client';
import { readCache, writeCache } from '../cache/json-store';
import { addDays, diffNights, enumerateNights } from '../dates';
import { localizeProperty } from '../localize';
import { getProperties } from './cms';
import type {
  AlternativeWindow,
  Beds24Offer,
  CalendarSnapshot,
  PropertyRecord,
  PropertySummary,
  SearchQuery,
  SearchResponse,
} from '../types';

const CALENDAR_TTL_MS = 6 * 60 * 60 * 1000;
const OFFER_TTL_MS = 5 * 60 * 1000;

export async function getCalendarSnapshot(property: PropertyRecord) {
  const key = `room_${property.beds24RoomId}`;
  const cached = await readCache<CalendarSnapshot>('calendar', key);
  if (cached) return cached;

  const snapshot = await fetchBeds24Calendar(property);
  await writeCache('calendar', key, snapshot, CALENDAR_TTL_MS);
  return snapshot;
}

function rangeAvailable(snapshot: CalendarSnapshot, property: PropertyRecord, query: SearchQuery) {
  if (query.guests > property.maxGuests) return false;
  const nights = diffNights(query.checkIn, query.checkOut);
  if (nights < property.pricing.minStay) return false;

  return enumerateNights(query.checkIn, query.checkOut).every((dateKey, index) => {
    const day = snapshot.days[dateKey];
    if (!day) return false;
    if (!day.available) return false;
    if (index === 0 && nights < day.minStay) return false;
    return true;
  });
}

async function getOfferMap(query: SearchQuery, properties: PropertyRecord[]) {
  const key = `offers_${properties.map((property) => property.beds24RoomId).join('_')}_${query.checkIn}_${query.checkOut}_${query.guests}`;
  const cached = await readCache<Beds24Offer[]>('offers', key);
  if (cached) {
    return new Map(cached.map((offer) => [offer.roomId, offer]));
  }

  let offers: Beds24Offer[] = [];

  if (isBeds24Configured()) {
    try {
      offers = await fetchBeds24Offers(
        query,
        properties.map((property) => property.beds24RoomId),
      );
    } catch {
      offers = properties.map((property) => fallbackOffer(property, query));
    }
  } else {
    offers = properties.map((property) => fallbackOffer(property, query));
  }

  await writeCache('offers', key, offers, OFFER_TTL_MS);
  return new Map(offers.map((offer) => [offer.roomId, offer]));
}

function toSummary(property: PropertyRecord, query: SearchQuery, offer: Beds24Offer): PropertySummary {
  const localized = localizeProperty(property, query.locale);
  const nights = diffNights(query.checkIn, query.checkOut);
  return {
    propertyId: property.id,
    slug: localized.slug,
    title: localized.title,
    summary: localized.summary,
    locationLabel: localized.locationLabel,
    distanceLabel: localized.distanceLabel,
    heroImage: property.heroImage,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    maxGuests: property.maxGuests,
    available: offer.available,
    quote: {
      currency: offer.currency,
      nights,
      pricePerNight: offer.pricePerNight,
      subtotal: offer.pricePerNight * nights,
      cleaningFee: offer.cleaningFee,
      taxes: offer.taxes,
      totalPrice: offer.totalPrice,
      depositAmount: Math.round(offer.totalPrice * property.pricing.depositRate),
    },
  };
}

async function alternativeCount(properties: PropertyRecord[], query: SearchQuery) {
  const matches = await Promise.all(
    properties.map(async (property) => {
      const snapshot = await getCalendarSnapshot(property);
      return rangeAvailable(snapshot, property, query);
    }),
  );
  return matches.filter(Boolean).length;
}

async function buildAlternatives(properties: PropertyRecord[], query: SearchQuery): Promise<AlternativeWindow[]> {
  const offsets = [-7, -3, 3, 7];
  const nights = diffNights(query.checkIn, query.checkOut);

  const windows = await Promise.all(
    offsets.map(async (offset) => {
      const checkIn = addDays(query.checkIn, offset);
      const checkOut = addDays(checkIn, nights);
      const availableCount = await alternativeCount(properties, { ...query, checkIn, checkOut });
      return {
        label: offset > 0 ? `+${offset} Tage` : `${offset} Tage`,
        checkIn,
        checkOut,
        availableCount,
      };
    }),
  );

  return windows.filter((window) => window.availableCount > 0);
}

export async function searchProperties(query: SearchQuery): Promise<SearchResponse> {
  const properties = (await getProperties()).filter((property) => property.maxGuests >= query.guests);

  const candidates = (
    await Promise.all(
      properties.map(async (property) => {
        const snapshot = await getCalendarSnapshot(property);
        const quickAvailability = rangeAvailable(snapshot, property, query);
        if (!quickAvailability) return null;
        if (isBeds24Configured()) {
          try {
            const liveStillAvailable = await fetchBeds24Availability(query, property.beds24RoomId);
            if (!liveStillAvailable) return null;
          } catch {
            return property;
          }
        }
        return property;
      }),
    )
  ).filter(Boolean) as PropertyRecord[];

  const offers = await getOfferMap(query, candidates.length > 0 ? candidates : properties);

  const results = candidates
    .map((property) => {
      const offer = offers.get(property.beds24RoomId) ?? fallbackOffer(property, query);
      return toSummary(property, query, offer);
    })
    .filter((item) => item.available)
    .sort((left, right) => {
      const leftProperty = candidates.find((property) => property.id === left.propertyId);
      const rightProperty = candidates.find((property) => property.id === right.propertyId);
      const priorityDelta = (leftProperty?.priority ?? 999) - (rightProperty?.priority ?? 999);
      if (priorityDelta !== 0) return priorityDelta;
      return left.quote.totalPrice - right.quote.totalPrice;
    });

  return {
    query,
    results,
    alternatives: results.length === 0 ? await buildAlternatives(properties, query) : [],
    generatedAt: new Date().toISOString(),
    source: isBeds24Configured() ? 'beds24' : 'fallback',
  };
}
