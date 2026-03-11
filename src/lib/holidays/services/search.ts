import { addDays, diffNights } from '../dates';
import { localizeProperty } from '../localize';
import { getProperties } from './cms';
import { getInventorySnapshot, getInventorySnapshots, quoteFromInventorySnapshot } from './inventory-snapshots';
import { getBeds24OfferMap, toPriceBreakdownFromOffer } from './offers';
import type {
  AlternativeWindow,
  CalendarSnapshot,
  PropertyRecord,
  PropertySummary,
  SearchQuery,
  SearchResponse,
} from '../types';

function matchesLocationFilter(property: PropertyRecord, locations: string[]) {
  if (locations.length === 0) return true;

  const candidates = new Set<string>();
  if (property.locationSlugs) {
    Object.values(property.locationSlugs)
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => candidates.add(value));
  }

  return locations.some((location) => candidates.has(location));
}

export async function getCalendarSnapshot(property: PropertyRecord) {
  return getInventorySnapshot(property);
}

function toSummary(
  property: PropertyRecord,
  query: SearchQuery,
  snapshot: CalendarSnapshot,
  totalPrice: ReturnType<typeof toPriceBreakdownFromOffer>,
): PropertySummary | null {
  const localized = localizeProperty(property, query.locale);

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
    available: true,
    quote: totalPrice,
  };
}

async function alternativeCount(properties: PropertyRecord[], query: SearchQuery) {
  const snapshots = await getInventorySnapshots(properties);
  const matches = properties.map((property) => {
    const snapshot = snapshots.get(property.beds24RoomId);
    return snapshot ? Boolean(quoteFromInventorySnapshot(property, query, snapshot)) : false;
  });
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
  const selectedLocations = query.locations ?? [];
  const properties = (await getProperties()).filter((property) => {
    return property.maxGuests >= query.guests && matchesLocationFilter(property, selectedLocations);
  });
  const snapshots = await getInventorySnapshots(properties);
  const availableProperties = properties.filter((property) => {
    const snapshot = snapshots.get(property.beds24RoomId);
    return snapshot ? Boolean(quoteFromInventorySnapshot(property, query, snapshot)) : false;
  });
  const offers = await getBeds24OfferMap(query, availableProperties);

  const results = availableProperties
    .map((property) => {
      const snapshot = snapshots.get(property.beds24RoomId);
      const offer = offers.get(property.beds24RoomId);
      if (!snapshot) return null;
      const fallback = quoteFromInventorySnapshot(property, query, snapshot);
      if (!fallback) return null;
      const breakdown = offer?.available
        ? toPriceBreakdownFromOffer(property, query, offer)
        : fallback.quote;
      return toSummary(property, query, snapshot, breakdown);
    })
    .filter((item): item is PropertySummary => Boolean(item))
    .sort((left, right) => {
      const leftProperty = properties.find((property) => property.id === left.propertyId);
      const rightProperty = properties.find((property) => property.id === right.propertyId);
      const priorityDelta = (leftProperty?.priority ?? 999) - (rightProperty?.priority ?? 999);
      if (priorityDelta !== 0) return priorityDelta;
      return left.quote.totalPrice - right.quote.totalPrice;
    });

  return {
    query,
    results,
    alternatives: results.length === 0 ? await buildAlternatives(properties, query) : [],
    generatedAt: new Date().toISOString(),
    source: 'beds24',
  };
}
