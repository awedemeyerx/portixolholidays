import { fetchBeds24PropertyCatalog, isBeds24Configured } from '../beds24/client';
import type { Beds24ContentRecord, Localized, PropertyRecord } from '../types';
import { getPayloadClient } from '@/lib/payload';

type RawDoc = Record<string, unknown>;

function emptyLocalized(): Localized {
  return { de: '', en: '', es: '' };
}

function hasText(value: string | undefined | null): value is string {
  return Boolean(value && value.trim());
}

function toLocalized(value: unknown, fieldName?: string): Localized {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return { de: normalized, en: normalized, es: normalized };
  }

  if (!value || typeof value !== 'object') {
    return emptyLocalized();
  }

  const record = value as RawDoc;
  const localized = {
    de:
      String(
        record.de ??
          record.DE ??
          (fieldName ? record[`${fieldName}DE`] : '') ??
          (fieldName ? record[`${fieldName}_de`] : '') ??
          '',
      ).trim(),
    en:
      String(
        record.en ??
          record.EN ??
          (fieldName ? record[`${fieldName}EN`] : '') ??
          (fieldName ? record[`${fieldName}_en`] : '') ??
          '',
      ).trim(),
    es:
      String(
        record.es ??
          record.ES ??
          (fieldName ? record[`${fieldName}ES`] : '') ??
          (fieldName ? record[`${fieldName}_es`] : '') ??
          '',
      ).trim(),
  };

  if (hasText(localized.de) || hasText(localized.en) || hasText(localized.es)) {
    const fallback = localized.de || localized.en || localized.es;
    return {
      de: localized.de || fallback,
      en: localized.en || fallback,
      es: localized.es || fallback,
    };
  }

  return emptyLocalized();
}

function mergeLocalized(base: Localized, override: Localized) {
  return {
    de: override.de || base.de,
    en: override.en || base.en,
    es: override.es || base.es,
  };
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
  if (normalized.length <= 180) return normalized;
  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function maybeNumber(...values: unknown[]) {
  for (const value of values) {
    const next = Number(value);
    if (Number.isFinite(next) && next > 0) {
      return next;
    }
  }
  return undefined;
}

function maybeString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function looksLikeImage(value: string) {
  return /^https?:\/\//i.test(value) && /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(value);
}

function collectImageUrls(value: unknown): string[] {
  if (typeof value === 'string') {
    return looksLikeImage(value) ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectImageUrls(item));
  }

  if (value && typeof value === 'object') {
    return Object.values(value as RawDoc).flatMap((entry) => collectImageUrls(entry));
  }

  return [];
}

function isCandidateRecord(value: RawDoc) {
  return Object.keys(value).some((key) => /room|property|image|photo|picture|gallery|description|summary|name/i.test(key));
}

function flattenRecords(value: unknown): RawDoc[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenRecords(entry));
  }

  if (value && typeof value === 'object') {
    const record = value as RawDoc;
    const nested = Object.values(record).flatMap((entry) => flattenRecords(entry));
    return isCandidateRecord(record) ? [record, ...nested] : nested;
  }

  return [];
}

function buildLocationLabel(record: RawDoc) {
  return maybeString(
    [record.area, record.city].filter(Boolean).join(', '),
    [record.neighbourhood, record.city].filter(Boolean).join(', '),
    record.city,
    record.country,
    record.address,
  );
}

function normalizeContentRecord(record: RawDoc): Omit<Beds24ContentRecord, 'id' | 'lastSyncedAt'> | null {
  const beds24PropertyId = maybeNumber(
    record.propertyId,
    record.propertyID,
    (record.property as RawDoc | undefined)?.id,
  );
  const beds24RoomId = maybeNumber(
    record.roomId,
    record.roomID,
    record.id,
    (record.room as RawDoc | undefined)?.id,
  );

  if (!beds24PropertyId && !beds24RoomId) {
    return null;
  }

  const title = toLocalized(
    record.name ??
      record.title ??
      record.roomName ??
      record.roomTitle ??
      (record.room as RawDoc | undefined)?.name ??
      (record.property as RawDoc | undefined)?.name,
  );
  const description = toLocalized(
    record.description ??
      record.longDescription ??
      record.roomDescription ??
      record.propertyDescription ??
      record.desc ??
      (record.room as RawDoc | undefined)?.description ??
      (record.property as RawDoc | undefined)?.description,
  );
  const summarySource =
    maybeString(record.summary, record.shortDescription, record.teaser) ||
    summarize(description.de || description.en || description.es);
  const summary = toLocalized(summarySource);
  const locationLabel = toLocalized(buildLocationLabel(record));
  const images = Array.from(
    new Set(
      collectImageUrls(
        record.images ??
          record.photos ??
          record.pictures ??
          record.gallery ??
          record.image ??
          record.photo ??
          record,
      ),
    ),
  );

  return {
    beds24PropertyId: beds24PropertyId ?? 0,
    beds24RoomId: beds24RoomId ?? 0,
    title,
    summary,
    description,
    locationLabel,
    heroImage: images[0] ?? '',
    gallery: images,
    bedrooms: maybeNumber(record.bedrooms, record.beds, record.numBedrooms),
    bathrooms: maybeNumber(record.bathrooms, record.baths, record.numBathrooms),
    maxGuests: maybeNumber(record.maxGuests, record.maxPeople, record.maxOccupancy, record.occupancy),
    raw: record,
  };
}

function mapBeds24ContentDoc(doc: RawDoc): Beds24ContentRecord {
  const title = mapLocalizedGroup(doc.title as RawDoc | undefined, 'title');
  const summary = mapLocalizedGroup(doc.summary as RawDoc | undefined, 'summary');
  const description = mapLocalizedGroup(doc.description as RawDoc | undefined, 'description');
  const locationLabel = mapLocalizedGroup(doc.locationLabel as RawDoc | undefined, 'locationLabel');
  const gallery = Array.isArray(doc.galleryUrls)
    ? doc.galleryUrls
        .map((item) => String((item as RawDoc).url ?? '').trim())
        .filter(Boolean)
    : [];

  return {
    id: String(doc.id),
    beds24PropertyId: Number(doc.beds24PropertyId ?? 0),
    beds24RoomId: Number(doc.beds24RoomId ?? 0),
    title,
    summary,
    description,
    locationLabel,
    heroImage: String(doc.heroImageUrl ?? '').trim(),
    gallery,
    bedrooms: maybeNumber(doc.bedrooms),
    bathrooms: maybeNumber(doc.bathrooms),
    maxGuests: maybeNumber(doc.maxGuests),
    lastSyncedAt: String(doc.lastSyncedAt ?? ''),
    raw: (doc.raw as RawDoc | undefined) ?? undefined,
  };
}

export function mergePropertyWithBeds24Content(property: PropertyRecord, content: Beds24ContentRecord | null) {
  if (!content) return property;

  return {
    ...property,
    title: mergeLocalized(property.title, content.title),
    summary: mergeLocalized(property.summary, content.summary),
    description: mergeLocalized(property.description, content.description),
    locationLabel: mergeLocalized(property.locationLabel, content.locationLabel),
    heroImage: content.heroImage || property.heroImage,
    gallery: content.gallery.length > 0 ? content.gallery : property.gallery,
    bedrooms: content.bedrooms ?? property.bedrooms,
    bathrooms: content.bathrooms ?? property.bathrooms,
    maxGuests: content.maxGuests ?? property.maxGuests,
  };
}

export async function getBeds24ContentRecords() {
  const payload = await getPayloadClient();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: 'beds24-property-content',
      limit: 200,
      sort: '-lastSyncedAt',
    });

    return result.docs.map((doc) => mapBeds24ContentDoc(doc as unknown as RawDoc));
  } catch {
    return [];
  }
}

export async function syncBeds24PropertyContent() {
  if (!isBeds24Configured()) {
    throw new Error('Beds24 credentials are not configured.');
  }

  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error('Payload CMS is not configured.');
  }

  const [catalog, existing] = await Promise.all([
    fetchBeds24PropertyCatalog(),
    payload.find({
      collection: 'beds24-property-content',
      limit: 500,
    }),
  ]);

  const existingByKey = new Map(
    existing.docs.map((doc) => {
      const record = doc as unknown as RawDoc;
      return [`${record.beds24PropertyId}:${record.beds24RoomId}`, record];
    }),
  );

  const seenKeys = new Set<string>();
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const record of flattenRecords(catalog)) {
    const normalized = normalizeContentRecord(record);
    if (!normalized) continue;

    const key = `${normalized.beds24PropertyId}:${normalized.beds24RoomId}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    if (!normalized.heroImage && normalized.gallery.length === 0 && !hasText(normalized.description.de)) {
      skipped.push(key);
      continue;
    }

    const payloadData = {
      internalName: normalized.title.de || normalized.title.en || normalized.title.es || key,
      beds24PropertyId: normalized.beds24PropertyId,
      beds24RoomId: normalized.beds24RoomId,
      title: {
        titleDE: normalized.title.de,
        titleEN: normalized.title.en,
        titleES: normalized.title.es,
      },
      summary: {
        summaryDE: normalized.summary.de,
        summaryEN: normalized.summary.en,
        summaryES: normalized.summary.es,
      },
      description: {
        descriptionDE: normalized.description.de,
        descriptionEN: normalized.description.en,
        descriptionES: normalized.description.es,
      },
      locationLabel: {
        locationLabelDE: normalized.locationLabel.de,
        locationLabelEN: normalized.locationLabel.en,
        locationLabelES: normalized.locationLabel.es,
      },
      heroImageUrl: normalized.heroImage,
      galleryUrls: normalized.gallery.map((url) => ({ url })),
      bedrooms: normalized.bedrooms,
      bathrooms: normalized.bathrooms,
      maxGuests: normalized.maxGuests,
      lastSyncedAt: new Date().toISOString(),
      raw: normalized.raw,
    };

    const existingDoc = existingByKey.get(key);
    if (existingDoc) {
      await payload.update({
        collection: 'beds24-property-content',
        id: String(existingDoc.id),
        data: payloadData,
      });
      updated.push(key);
    } else {
      await payload.create({
        collection: 'beds24-property-content',
        data: payloadData,
      });
      created.push(key);
    }
  }

  return {
    created,
    updated,
    skipped,
    syncedAt: new Date().toISOString(),
  };
}
