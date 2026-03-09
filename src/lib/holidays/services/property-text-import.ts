import { getPayloadClient } from '@/lib/payload';
import { getProperties } from './cms';
import type {
  Localized,
  PropertyRecord,
  PropertyTextImportItem,
  PropertyTextImportResult,
} from '../types';

type RawDoc = Record<string, unknown>;

function emptyLocalized(): Localized {
  return { de: '', en: '', es: '' };
}

function hasText(value: string | undefined | null): value is string {
  return Boolean(value && value.trim());
}

function normalizeText(value: string) {
  const lines = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim());

  const normalized: string[] = [];
  let previousBlank = true;

  for (const line of lines) {
    if (!line) {
      if (!previousBlank) {
        normalized.push('');
      }
      previousBlank = true;
      continue;
    }

    normalized.push(line);
    previousBlank = false;
  }

  return normalized.join('\n').trim();
}

function normalizeLocalized(value: Partial<Localized> | undefined, fallback?: Localized): Localized {
  const next = {
    de: normalizeText(String(value?.de ?? fallback?.de ?? '')),
    en: normalizeText(String(value?.en ?? fallback?.en ?? '')),
    es: normalizeText(String(value?.es ?? fallback?.es ?? '')),
  };

  if (hasText(next.de) || hasText(next.en) || hasText(next.es)) {
    return next;
  }

  return fallback ?? emptyLocalized();
}

async function findPropertyByImport(item: PropertyTextImportItem) {
  const properties = await getProperties();

  const byIds = properties.find((property) => {
    const propertyMatch = !item.beds24PropertyId || property.beds24PropertyId === item.beds24PropertyId;
    const roomMatch = !item.beds24RoomId || property.beds24RoomId === item.beds24RoomId;
    return propertyMatch && roomMatch;
  });
  if (byIds) return byIds;

  if (item.propertySlug) {
    const slug = item.propertySlug.trim().toLowerCase();
    const bySlug = properties.find((property) =>
      Object.values(property.slugs).some((value) => value.trim().toLowerCase() === slug),
    );
    if (bySlug) return bySlug;
  }

  if (item.internalName) {
    const normalized = item.internalName.trim().toLowerCase();
    const byName = properties.find((property) => {
      const titleMatch = Object.values(property.title).some((value) => value.trim().toLowerCase() === normalized);
      return titleMatch || property.id === normalized;
    });
    if (byName) return byName;
  }

  return null;
}

async function findDocByBeds24(
  payload: NonNullable<Awaited<ReturnType<typeof getPayloadClient>>>,
  collection: 'beds24-property-content' | 'properties',
  property: PropertyRecord,
) {
  const result = await payload.find({
    collection,
    limit: 1,
    where: {
      and: [
        { beds24PropertyId: { equals: property.beds24PropertyId } },
        { beds24RoomId: { equals: property.beds24RoomId } },
      ],
    },
  });

  return (result.docs[0] as RawDoc | undefined) ?? null;
}

async function ensureBeds24ContentDoc(
  payload: NonNullable<Awaited<ReturnType<typeof getPayloadClient>>>,
  property: PropertyRecord,
) {
  const existing = await findDocByBeds24(payload, 'beds24-property-content', property);
  if (existing) return existing;

  return (await payload.create({
    collection: 'beds24-property-content',
    data: {
      internalName: property.title.de || property.title.en || property.title.es || property.id,
      beds24PropertyId: property.beds24PropertyId,
      beds24RoomId: property.beds24RoomId,
      title: {
        titleDE: property.title.de,
        titleEN: property.title.en,
        titleES: property.title.es,
      },
      summary: {
        summaryDE: '',
        summaryEN: '',
        summaryES: '',
      },
      description: {
        descriptionDE: '',
        descriptionEN: '',
        descriptionES: '',
      },
      locationLabel: {
        locationLabelDE: '',
        locationLabelEN: '',
        locationLabelES: '',
      },
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      heroImageUrl: '',
      galleryUrls: [],
      lastSyncedAt: new Date().toISOString(),
    },
  })) as RawDoc;
}

export async function importPropertyTexts(items: PropertyTextImportItem[]): Promise<PropertyTextImportResult[]> {
  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error('Payload CMS is not configured.');
  }

  const results: PropertyTextImportResult[] = [];

  for (const item of items) {
    const property = await findPropertyByImport(item);
    if (!property) {
      throw new Error(
        `No property match found for import target ${item.propertySlug ?? item.internalName ?? item.beds24PropertyId ?? 'unknown'}.`,
      );
    }

    const description = normalizeLocalized(item.description);
    if (!hasText(description.de) && !hasText(description.en) && !hasText(description.es)) {
      throw new Error(`No property text content found for ${property.id}.`);
    }

    const summary = normalizeLocalized(item.summary);
    const locationLabel = normalizeLocalized(item.locationLabel, property.locationLabel);

    const beds24ContentDoc = await ensureBeds24ContentDoc(payload, property);
    const existingRaw = (beds24ContentDoc.raw as RawDoc | undefined) ?? {};
    const importedAt = new Date().toISOString();

    await payload.update({
      collection: 'beds24-property-content',
      id: String(beds24ContentDoc.id),
      data: {
        summary: {
          summaryDE: summary.de,
          summaryEN: summary.en,
          summaryES: summary.es,
        },
        description: {
          descriptionDE: description.de,
          descriptionEN: description.en,
          descriptionES: description.es,
        },
        locationLabel: {
          locationLabelDE: locationLabel.de,
          locationLabelEN: locationLabel.en,
          locationLabelES: locationLabel.es,
        },
        lastSyncedAt: importedAt,
        raw: {
          ...existingRaw,
          importedContentSource: 'booking-page-html',
          importedContentAt: importedAt,
          importedContentLocales: ['de', 'en', 'es'].filter((locale) =>
            hasText(description[locale as keyof Localized]) ||
            hasText(summary[locale as keyof Localized]) ||
            hasText(locationLabel[locale as keyof Localized]),
          ),
        },
      },
    });

    const propertyDoc = await findDocByBeds24(payload, 'properties', property);
    if (propertyDoc?.id) {
      await payload.update({
        collection: 'properties',
        id: String(propertyDoc.id),
        data: {
          summary: {
            summaryDE: summary.de,
            summaryEN: summary.en,
            summaryES: summary.es,
          },
          description: {
            descriptionDE: description.de,
            descriptionEN: description.en,
            descriptionES: description.es,
          },
          locationLabel: {
            locationLabelDE: locationLabel.de,
            locationLabelEN: locationLabel.en,
            locationLabelES: locationLabel.es,
          },
          seoDescription: {
            seoDescriptionDE: summary.de,
            seoDescriptionEN: summary.en,
            seoDescriptionES: summary.es,
          },
        },
      });
    }

    results.push({
      propertyKey: property.id,
      target: {
        beds24PropertyId: property.beds24PropertyId,
        beds24RoomId: property.beds24RoomId,
        internalName: property.title.de || property.title.en || property.title.es || property.id,
      },
      summary,
      locationLabel,
    });
  }

  return results;
}
