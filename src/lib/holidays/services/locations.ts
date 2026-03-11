import { getPayloadClient } from '@/lib/payload';
import { clearRemembered, remember } from '../cache/memory';
import { locationContentOverrides } from '../data/location-content';
import { defaultLocationGroups } from '../data/locations';
import type { Beds24ContentRecord, Localized, LocationRecord, PropertyRecord } from '../types';
import { getBeds24ContentRecords, getLiveBeds24ContentRecords } from './beds24-content';

type RawDoc = Record<string, unknown>;

const LOCATION_TTL_MS = 60_000;

function emptyLocalized(): Localized {
  return { de: '', en: '', es: '' };
}

function mapLocalizedGroup(group: RawDoc | undefined, fieldName: string): Localized {
  return {
    de: String(group?.[`${fieldName}DE`] ?? '').trim(),
    en: String(group?.[`${fieldName}EN`] ?? '').trim(),
    es: String(group?.[`${fieldName}ES`] ?? '').trim(),
  };
}

function summarize(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= 200) return normalized;
  return `${normalized.slice(0, 197).trimEnd()}...`;
}

function mergeLocalized(base: Localized, override?: Localized) {
  if (!override) return base;
  return {
    de: override.de || base.de,
    en: override.en || base.en,
    es: override.es || base.es,
  };
}

function applyLocationOverrides(location: LocationRecord): LocationRecord {
  const slug = location.slugs.en || location.slugs.de || location.slugs.es;
  const override = locationContentOverrides[slug];
  if (!override) return location;

  return {
    ...location,
    summary: mergeLocalized(location.summary, override.summary),
    description: mergeLocalized(location.description, override.description),
    directions: mergeLocalized(location.directions, override.directions),
  };
}

function mapLocationDoc(doc: RawDoc): LocationRecord {
  const beds24PropertyIds = Array.isArray(doc.beds24PropertyIds)
    ? doc.beds24PropertyIds
        .map((item) => Number((item as RawDoc).value ?? item))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];

  return {
    id: String(doc.id),
    priority: Number(doc.priority ?? 999),
    slugs: mapLocalizedGroup(doc.slugs as RawDoc | undefined, 'slugs'),
    title: mapLocalizedGroup(doc.title as RawDoc | undefined, 'title'),
    summary: mapLocalizedGroup(doc.summary as RawDoc | undefined, 'summary'),
    description: mapLocalizedGroup(doc.description as RawDoc | undefined, 'description'),
    directions: mapLocalizedGroup(doc.directions as RawDoc | undefined, 'directions'),
    heroImage: String(doc.heroImageUrl ?? '').trim(),
    beds24PropertyIds,
  };
}

function firstLocalizedValue(
  records: Beds24ContentRecord[],
  selector: (record: Beds24ContentRecord) => Localized,
): Localized {
  const next = emptyLocalized();

  for (const locale of ['de', 'en', 'es'] as const) {
    for (const record of records) {
      const value = selector(record)[locale]?.trim();
      if (value) {
        next[locale] = value;
        break;
      }
    }
  }

  const fallback = next.de || next.en || next.es;
  if (!fallback) return emptyLocalized();

  return {
    de: next.de || fallback,
    en: next.en || fallback,
    es: next.es || fallback,
  };
}

export async function getLocations(): Promise<LocationRecord[]> {
  return remember('cms:locations', LOCATION_TTL_MS, async () => {
    const payload = await getPayloadClient();
    if (!payload) return [];

    try {
      const result = await payload.find({
        collection: 'locations',
        limit: 100,
        sort: 'priority',
      });

      return result.docs.map((doc) => applyLocationOverrides(mapLocationDoc(doc as unknown as RawDoc)));
    } catch {
      return [];
    }
  });
}

export async function attachLocationsToProperties(properties: PropertyRecord[]) {
  const locations = await getLocations();
  if (locations.length === 0) return properties;

  return properties.map((property) => {
    const match =
      locations.find((location) => location.id === property.locationId) ??
      locations.find((location) => location.beds24PropertyIds.includes(property.beds24PropertyId));

    if (!match) return property;

    return {
      ...property,
      locationId: match.id,
      locationSlugs: match.slugs,
      locationTitle: match.title,
      locationLabel: {
        de: match.title.de || property.locationLabel.de,
        en: match.title.en || match.title.de || property.locationLabel.en,
        es: match.title.es || match.title.en || match.title.de || property.locationLabel.es,
      },
    };
  });
}

export async function syncBeds24Locations() {
  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error('Payload CMS is not configured.');
  }

  const persisted = await getBeds24ContentRecords();
  const contentRecords = persisted.length > 0 ? persisted : await getLiveBeds24ContentRecords();
  const existing = await payload.find({
    collection: 'locations',
    limit: 100,
  });

  const existingBySlug = new Map(
    existing.docs.map((doc) => {
      const mapped = mapLocationDoc(doc as unknown as RawDoc);
      return [mapped.slugs.en || mapped.slugs.de || mapped.slugs.es, doc as unknown as RawDoc];
    }),
  );

  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const group of defaultLocationGroups) {
    const records = contentRecords.filter((record) => group.beds24PropertyIds.includes(record.beds24PropertyId));
    if (records.length === 0) {
      skipped.push(group.slug);
      continue;
    }

    const description = firstLocalizedValue(records, (record) => record.locationDescription);
    const directions = firstLocalizedValue(records, (record) => record.directions);
    const summary = {
      de: summarize(description.de),
      en: summarize(description.en),
      es: summarize(description.es),
    };
    const override = locationContentOverrides[group.slug];
    const mergedSummary = mergeLocalized(summary, override?.summary);
    const mergedDescription = mergeLocalized(description, override?.description);
    const mergedDirections = mergeLocalized(directions, override?.directions);
    const heroImage =
      records.find((record) => record.heroImage.trim())?.heroImage ??
      records.find((record) => record.gallery.length > 0)?.gallery[0] ??
      '';

    const data = {
      internalName: group.title.en || group.title.de || group.slug,
      priority: group.priority,
      slugs: {
        slugsDE: group.slug,
        slugsEN: group.slug,
        slugsES: group.slug,
      },
      title: {
        titleDE: group.title.de,
        titleEN: group.title.en,
        titleES: group.title.es,
      },
      summary: {
        summaryDE: mergedSummary.de,
        summaryEN: mergedSummary.en,
        summaryES: mergedSummary.es,
      },
      description: {
        descriptionDE: mergedDescription.de,
        descriptionEN: mergedDescription.en,
        descriptionES: mergedDescription.es,
      },
      directions: {
        directionsDE: mergedDirections.de,
        directionsEN: mergedDirections.en,
        directionsES: mergedDirections.es,
      },
      heroImageUrl: heroImage,
      beds24PropertyIds: group.beds24PropertyIds.map((value) => ({ value })),
    };

    const existingDoc = existingBySlug.get(group.slug);
    if (existingDoc?.id) {
      await payload.update({
        collection: 'locations',
        id: String(existingDoc.id),
        data,
      });
      updated.push(group.slug);
    } else {
      await payload.create({
        collection: 'locations',
        data,
      });
      created.push(group.slug);
    }
  }

  clearRemembered('cms:locations');
  clearRemembered('cms:properties');

  return {
    created,
    updated,
    skipped,
    syncedAt: new Date().toISOString(),
  };
}
