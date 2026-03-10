import { addDays, diffNights } from '../dates';
import { localizeProperty } from '../localize';
import { getProperties } from './cms';
import { getInventorySnapshot, quoteFromInventorySnapshot } from './inventory-snapshots';
import type {
  AlternativeWindow,
  CalendarSnapshot,
  PropertyRecord,
  PropertySummary,
  SearchQuery,
  SearchResponse,
} from '../types';

export async function getCalendarSnapshot(property: PropertyRecord) {
  return getInventorySnapshot(property);
}

function toSummary(property: PropertyRecord, query: SearchQuery, snapshot: CalendarSnapshot): PropertySummary | null {
  const localized = localizeProperty(property, query.locale);
  const priced = quoteFromInventorySnapshot(property, query, snapshot);
  if (!priced) return null;

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
    quote: priced.quote,
  };
}

async function alternativeCount(properties: PropertyRecord[], query: SearchQuery) {
  const matches = await Promise.all(
    properties.map(async (property) => {
      const snapshot = await getInventorySnapshot(property);
      return Boolean(quoteFromInventorySnapshot(property, query, snapshot));
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

  const results = (
    await Promise.all(
      properties.map(async (property) => {
        const snapshot = await getInventorySnapshot(property);
        return toSummary(property, query, snapshot);
      }),
    )
  )
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
