import { fetchBeds24PropertyCatalog, isBeds24Configured } from '../beds24/client';
import { clearRemembered } from '../cache/memory';
import { readCache, writeCache } from '../cache/json-store';
import type { Beds24ContentRecord, Localized, PropertyPricingFallback, PropertyRecord } from '../types';
import { getPayloadClient } from '@/lib/payload';

type RawDoc = Record<string, unknown>;
const CATALOG_TTL_MS = 6 * 60 * 60 * 1000;

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

function mergeLocalizedPreferBase(base: Localized, override: Localized) {
  return {
    de: base.de || override.de,
    en: base.en || override.en,
    es: base.es || override.es,
  };
}

function primaryLocalizedText(value: Localized) {
  return value.de || value.en || value.es || '';
}

function looksLikePlaceholderText(value: string) {
  const normalized = value.trim().toLowerCase();
  return !normalized || /^property\s+\d+$/i.test(value.trim()) || /^\d+:\d+$/.test(normalized) || /^\d+$/.test(normalized);
}

function hasVerifiedBeds24Raw(record: Beds24ContentRecord) {
  return Boolean(record.raw && Object.keys(record.raw).length > 0);
}

function isVerifiedPropertyImage(url: string) {
  const normalized = url.trim();
  return Boolean(
    normalized &&
      (normalized.startsWith('/api/media/file/') ||
        /^(https?:\/\/)(media\.xmlcal\.com|a0\.muscache\.com|images\.ctfassets\.net|res\.cloudinary\.com)/i.test(normalized)),
  );
}

function verifiedGalleryUrls(record: Beds24ContentRecord) {
  return record.gallery.filter((url) => isVerifiedPropertyImage(url));
}

function isRenderableBeds24Content(record: Beds24ContentRecord) {
  if (record.beds24PropertyId <= 0 || record.beds24RoomId <= 0) {
    return false;
  }

  if (isVerifiedPropertyImage(record.heroImage) || verifiedGalleryUrls(record).length > 0) {
    return true;
  }

  const titleText = primaryLocalizedText(record.title);
  const summaryText = primaryLocalizedText(record.summary);
  const descriptionText = primaryLocalizedText(record.description);

  return [titleText, summaryText, descriptionText].some((value) => hasText(value) && !looksLikePlaceholderText(value));
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

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, ' - ')
    .replace(/&hellip;/gi, '...')
    .replace(/&uuml;/gi, 'ü')
    .replace(/&ouml;/gi, 'ö')
    .replace(/&auml;/gi, 'ä')
    .replace(/&szlig;/gi, 'ß')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Auml;/g, 'Ä');
}

function normalizeMultilineText(value: string) {
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

function htmlToText(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const withBreaks = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n');

  const withoutTags = withBreaks.replace(/<[^>]+>/g, ' ');
  return normalizeMultilineText(decodeHtmlEntities(withoutTags));
}

function mapLocalizedEntries(entries: unknown, fieldNames: string[]): Localized {
  if (!Array.isArray(entries)) return emptyLocalized();

  const localized = emptyLocalized();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as RawDoc;
    const language = String(record.language ?? '').trim().toLowerCase();
    if (!['de', 'en', 'es'].includes(language)) continue;

    for (const fieldName of fieldNames) {
      const candidate = htmlToText(record[fieldName]);
      if (candidate) {
        localized[language as keyof Localized] = candidate;
        break;
      }
    }
  }

  const fallback = localized.de || localized.en || localized.es;
  if (!fallback) return emptyLocalized();

  return {
    de: localized.de || fallback,
    en: localized.en || fallback,
    es: localized.es || fallback,
  };
}

function extractLocationLabelFromDescription(value: string) {
  const lines = normalizeMultilineText(value).split('\n');
  for (const line of lines) {
    const match = line.match(/^(?:lage|location|ubicacion|ubicación)\s*[–:-]\s*(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
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

function extractCatalogRecords(value: unknown): RawDoc[] {
  const data = value && typeof value === 'object' ? (value as { data?: unknown }).data : undefined;
  if (Array.isArray(data)) {
    return data.filter((entry): entry is RawDoc => Boolean(entry && typeof entry === 'object'));
  }
  return flattenRecords(value);
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
  const primaryRoomType = Array.isArray(record.roomTypes) ? (record.roomTypes[0] as RawDoc | undefined) : undefined;
  const propertyTexts = Array.isArray(record.texts) ? (record.texts as RawDoc[]) : [];
  const roomTexts = Array.isArray(primaryRoomType?.texts) ? (primaryRoomType.texts as RawDoc[]) : [];
  const beds24PropertyId = maybeNumber(
    record.propertyId,
    record.propertyID,
    (record.property as RawDoc | undefined)?.id,
    record.id,
  );
  const beds24RoomId = maybeNumber(
    record.roomId,
    record.roomID,
    primaryRoomType?.id,
    (record.room as RawDoc | undefined)?.id,
    record.id,
  );

  if (!beds24PropertyId && !beds24RoomId) {
    return null;
  }

  const headline = mapLocalizedEntries([...roomTexts, ...propertyTexts], ['contentHeadline', 'headline', 'displayName']);
  const description = mapLocalizedEntries(
    [...propertyTexts, ...roomTexts],
    ['propertyDescription1', 'propertyDescription', 'roomDescription', 'contentDescription', 'propertyDescriptionBookingPage1'],
  );
  const locationDescription = mapLocalizedEntries(propertyTexts, ['locationDescription']);
  const directions = mapLocalizedEntries(propertyTexts, ['directions']);
  const houseRules = mapLocalizedEntries(propertyTexts, ['houseRules', 'generalPolicy', 'cancellationPolicy']);
  const title = toLocalized(
    record.name ??
      record.title ??
      record.roomName ??
      record.roomTitle ??
      primaryRoomType?.name ??
      (record.room as RawDoc | undefined)?.name ??
      (record.property as RawDoc | undefined)?.name,
  );
  const fallbackDescription = toLocalized(
    record.description ??
      record.longDescription ??
      record.roomDescription ??
      record.propertyDescription ??
      record.desc ??
      (record.room as RawDoc | undefined)?.description ??
      (record.property as RawDoc | undefined)?.description,
  );
  const normalizedDescription =
    primaryLocalizedText(description) ? description : {
      de: htmlToText(fallbackDescription.de),
      en: htmlToText(fallbackDescription.en),
      es: htmlToText(fallbackDescription.es),
    };
  const summary = primaryLocalizedText(headline)
    ? headline
    : toLocalized(
        maybeString(record.summary, record.shortDescription, record.teaser, primaryRoomType?.name) ||
          summarize(normalizedDescription.de || normalizedDescription.en || normalizedDescription.es),
      );
  const derivedLocationLabel = {
    de: extractLocationLabelFromDescription(normalizedDescription.de),
    en: extractLocationLabelFromDescription(normalizedDescription.en),
    es: extractLocationLabelFromDescription(normalizedDescription.es),
  };
  const fallbackLocationLabel = buildLocationLabel(record);
  const locationLabel = {
    de: derivedLocationLabel.de || fallbackLocationLabel,
    en: derivedLocationLabel.en || derivedLocationLabel.de || fallbackLocationLabel,
    es: derivedLocationLabel.es || derivedLocationLabel.en || derivedLocationLabel.de || fallbackLocationLabel,
  };
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
  const taxPercentage = Number(primaryRoomType?.taxPercentage ?? 0);
  const taxPersonNight = Number(primaryRoomType?.taxPerson ?? 0);
  const pricing: Partial<PropertyPricingFallback> = {
    nightly: maybeNumber(primaryRoomType?.rackRate, primaryRoomType?.minPrice),
    cleaningFee: Number.isFinite(Number(primaryRoomType?.cleaningFee ?? NaN))
      ? Number(primaryRoomType?.cleaningFee ?? 0)
      : undefined,
    taxes: taxPercentage === 0 && taxPersonNight === 0 ? 0 : undefined,
    taxPercentage: Number.isFinite(taxPercentage) ? taxPercentage : undefined,
    taxPersonNight: Number.isFinite(taxPersonNight) ? taxPersonNight : undefined,
    minStay: maybeNumber(primaryRoomType?.minStay, record.minStay),
    currency: String(record.currency ?? 'EUR') as PropertyPricingFallback['currency'],
  };

  return {
    beds24PropertyId: beds24PropertyId ?? 0,
    beds24RoomId: beds24RoomId ?? 0,
    title,
    summary,
    description: normalizedDescription,
    locationLabel,
    locationDescription,
    directions,
    houseRules,
    pricing,
    heroImage: images[0] ?? '',
    gallery: images,
    bedrooms: maybeNumber(record.bedrooms, record.beds, record.numBedrooms),
    bathrooms: maybeNumber(record.bathrooms, record.baths, record.numBathrooms),
    maxGuests: maybeNumber(record.maxGuests, record.maxPeople, record.maxOccupancy, record.occupancy, primaryRoomType?.maxPeople),
    raw: record,
  };
}

function mapBeds24ContentDoc(doc: RawDoc): Beds24ContentRecord {
  const title = mergeLocalized(
    toLocalized(String(doc.internalName ?? '').trim()),
    mapLocalizedGroup(doc.title as RawDoc | undefined, 'title'),
  );
  const summary = mapLocalizedGroup(doc.summary as RawDoc | undefined, 'summary');
  const description = mapLocalizedGroup(doc.description as RawDoc | undefined, 'description');
  const locationLabel = mapLocalizedGroup(doc.locationLabel as RawDoc | undefined, 'locationLabel');
  const locationDescription = mapLocalizedGroup(doc.locationDescription as RawDoc | undefined, 'locationDescription');
  const directions = mapLocalizedGroup(doc.directions as RawDoc | undefined, 'directions');
  const houseRules = mapLocalizedGroup(doc.houseRules as RawDoc | undefined, 'houseRules');
  const gallery = Array.isArray(doc.galleryUrls)
    ? doc.galleryUrls
        .map((item) => String((item as RawDoc).url ?? '').trim())
        .filter(Boolean)
    : [];
  const pricing = doc.pricing && typeof doc.pricing === 'object'
    ? (doc.pricing as Record<string, unknown>)
    : undefined;

  return {
    id: String(doc.id),
    beds24PropertyId: Number(doc.beds24PropertyId ?? 0),
    beds24RoomId: Number(doc.beds24RoomId ?? 0),
    title,
    summary,
    description,
    locationLabel,
    locationDescription,
    directions,
    houseRules,
    pricing: pricing
      ? {
          nightly: Number(pricing.nightly ?? 0) || undefined,
          cleaningFee: Number(pricing.cleaningFee ?? 0) || 0,
          taxes: Number(pricing.taxes ?? 0) || 0,
          taxPercentage: Number(pricing.taxPercentage ?? 0) || 0,
          taxPersonNight: Number(pricing.taxPersonNight ?? 0) || 0,
          minStay: Number(pricing.minStay ?? 0) || undefined,
          currency: 'EUR',
        }
      : undefined,
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

  const hasVerifiedText = hasVerifiedBeds24Raw(content);
  const verifiedHeroImage = isVerifiedPropertyImage(content.heroImage) ? content.heroImage : '';
  const verifiedGallery = verifiedGalleryUrls(content);
  const pricing = content.pricing
    ? {
        ...property.pricing,
        nightly: content.pricing.nightly ?? property.pricing.nightly,
        cleaningFee: content.pricing.cleaningFee ?? property.pricing.cleaningFee,
        taxes: content.pricing.taxes ?? property.pricing.taxes,
        taxPercentage: content.pricing.taxPercentage ?? property.pricing.taxPercentage ?? 0,
        taxPersonNight: content.pricing.taxPersonNight ?? property.pricing.taxPersonNight ?? 0,
        minStay: content.pricing.minStay ?? property.pricing.minStay,
        currency: content.pricing.currency ?? property.pricing.currency,
      }
    : property.pricing;

  return {
    ...property,
    beds24PropertyId: content.beds24PropertyId || property.beds24PropertyId,
    beds24RoomId: content.beds24RoomId || property.beds24RoomId,
    title: mergeLocalizedPreferBase(property.title, content.title),
    summary: hasVerifiedText ? mergeLocalizedPreferBase(property.summary, content.summary) : property.summary,
    description: hasVerifiedText ? mergeLocalizedPreferBase(property.description, content.description) : property.description,
    locationLabel: hasVerifiedText ? mergeLocalizedPreferBase(property.locationLabel, content.locationLabel) : property.locationLabel,
    seoTitle: mergeLocalizedPreferBase(property.seoTitle, content.title),
    seoDescription: hasVerifiedText
      ? mergeLocalizedPreferBase(property.seoDescription, content.summary)
      : property.seoDescription,
    heroImage: verifiedHeroImage || property.heroImage,
    gallery: verifiedGallery.length > 0 ? verifiedGallery : property.gallery,
    bedrooms: content.bedrooms ?? property.bedrooms,
    bathrooms: content.bathrooms ?? property.bathrooms,
    maxGuests: content.maxGuests ?? property.maxGuests,
    pricing,
  };
}

function normalizeLookupValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fallbackLocalized(value: string): Localized {
  return { de: value, en: value, es: value };
}

function localizeWithFallback(value: Localized, fallback: string) {
  const normalizedFallback = fallback.trim();
  return {
    de: value.de || normalizedFallback,
    en: value.en || normalizedFallback,
    es: value.es || normalizedFallback,
  };
}

function createSyntheticPropertyFromBeds24Content(content: Beds24ContentRecord): PropertyRecord {
  const titleText = content.title.de || content.title.en || content.title.es || `Property ${content.beds24PropertyId}`;
  const slug = normalizeLookupValue(titleText) || `property-${content.beds24PropertyId}`;
  const hasVerifiedText = hasVerifiedBeds24Raw(content);
  const summaryText = hasVerifiedText ? content.summary.de || content.summary.en || content.summary.es : '';
  const descriptionText = hasVerifiedText ? content.description.de || content.description.en || content.description.es : '';
  const locationText = hasVerifiedText ? content.locationLabel.de || content.locationLabel.en || content.locationLabel.es : '';
  const heroImage = isVerifiedPropertyImage(content.heroImage) ? content.heroImage : '';
  const gallery = verifiedGalleryUrls(content);

  return {
    id: slug,
    priority: 900,
    beds24PropertyId: content.beds24PropertyId,
    beds24RoomId: content.beds24RoomId,
    slugs: fallbackLocalized(slug),
    title: localizeWithFallback(content.title, titleText),
    summary: hasVerifiedText ? localizeWithFallback(content.summary, summaryText) : emptyLocalized(),
    description: hasVerifiedText ? localizeWithFallback(content.description, descriptionText) : emptyLocalized(),
    locationLabel: hasVerifiedText ? localizeWithFallback(content.locationLabel, locationText) : emptyLocalized(),
    distanceLabel: emptyLocalized(),
    bedrooms: content.bedrooms ?? 1,
    bathrooms: content.bathrooms ?? 1,
    maxGuests: content.maxGuests ?? 2,
    heroImage,
    gallery,
    highlights: [],
    amenities: [],
    houseRules: [],
    pricing: {
      nightly: content.pricing?.nightly ?? 240,
      cleaningFee: content.pricing?.cleaningFee ?? 0,
      taxes: content.pricing?.taxes ?? 0,
      taxPercentage: content.pricing?.taxPercentage ?? 0,
      taxPersonNight: content.pricing?.taxPersonNight ?? 0,
      minStay: content.pricing?.minStay ?? 3,
      depositRate: 0.3,
      currency: content.pricing?.currency ?? 'EUR',
    },
    cancellationSummary: emptyLocalized(),
    seoTitle: localizeWithFallback(content.title, titleText),
    seoDescription: hasVerifiedText ? localizeWithFallback(content.summary, summaryText) : emptyLocalized(),
    blockedRanges: [],
  };
}

function matchBeds24Content(property: PropertyRecord, records: Beds24ContentRecord[]) {
  const slugKeys = Object.values(property.slugs).map(normalizeLookupValue);
  const titleKeys = Object.values(property.title).map(normalizeLookupValue);

  return (
    records.find((entry) => entry.beds24RoomId === property.beds24RoomId) ??
    records.find((entry) => entry.beds24PropertyId === property.beds24PropertyId) ??
    records.find((entry) => {
      const entryTitleKey = normalizeLookupValue(entry.title.de || entry.title.en || entry.title.es);
      return slugKeys.includes(entryTitleKey) || titleKeys.includes(entryTitleKey);
    }) ??
    null
  );
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

    return result.docs
      .map((doc) => mapBeds24ContentDoc(doc as unknown as RawDoc))
      .filter((record) => isRenderableBeds24Content(record));
  } catch {
    return [];
  }
}

export async function getLiveBeds24ContentRecords() {
  if (!isBeds24Configured()) return [];

  const cached = await readCache<Beds24ContentRecord[]>('beds24-content', 'catalog_live');
  if (cached) return cached;

  const catalog = await fetchBeds24PropertyCatalog({
    includeAllRooms: true,
    includeLanguages: ['all'],
    includeTexts: ['all'],
  });
  const seenKeys = new Set<string>();
  const normalized = extractCatalogRecords(catalog)
    .map((record) => normalizeContentRecord(record))
    .filter((record): record is Omit<Beds24ContentRecord, 'id' | 'lastSyncedAt'> => Boolean(record))
    .filter((record) => {
      const key = `${record.beds24PropertyId}:${record.beds24RoomId}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    })
    .map((record) => ({
      id: `${record.beds24PropertyId}:${record.beds24RoomId}`,
      ...record,
      lastSyncedAt: new Date().toISOString(),
    }))
    .filter((record) => isRenderableBeds24Content(record as Beds24ContentRecord)) as Beds24ContentRecord[];

  await writeCache('beds24-content', 'catalog_live', normalized, CATALOG_TTL_MS);
  return normalized;
}

export async function resolveBeds24ContentForProperties(properties: PropertyRecord[]) {
  const persisted = await getBeds24ContentRecords();
  const live = persisted.length > 0 ? [] : await getLiveBeds24ContentRecords();
  const sourceRecords = persisted.length > 0 ? persisted : live;
  const matchedKeys = new Set<string>();

  const merged = properties.map((property) => {
    const match = matchBeds24Content(property, sourceRecords);
    if (match) {
      matchedKeys.add(`${match.beds24PropertyId}:${match.beds24RoomId}`);
    }
    return mergePropertyWithBeds24Content(property, match);
  });

  const synthetic = sourceRecords
    .filter((record) => !matchedKeys.has(`${record.beds24PropertyId}:${record.beds24RoomId}`))
    .map((record) => createSyntheticPropertyFromBeds24Content(record));

  return [...merged, ...synthetic];
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
    fetchBeds24PropertyCatalog({
      includeAllRooms: true,
      includeLanguages: ['all'],
      includeTexts: ['all'],
    }),
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

  for (const record of extractCatalogRecords(catalog)) {
    const normalized = normalizeContentRecord(record);
    if (!normalized) continue;

    const key = `${normalized.beds24PropertyId}:${normalized.beds24RoomId}`;
    const contentRecord = {
      id: key,
      ...normalized,
      lastSyncedAt: new Date().toISOString(),
    } as Beds24ContentRecord;

    if (!isRenderableBeds24Content(contentRecord)) continue;

    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const payloadData = {
      internalName: contentRecord.title.de || contentRecord.title.en || contentRecord.title.es || key,
      beds24PropertyId: contentRecord.beds24PropertyId,
      beds24RoomId: contentRecord.beds24RoomId,
      title: {
        titleDE: contentRecord.title.de,
        titleEN: contentRecord.title.en,
        titleES: contentRecord.title.es,
      },
      summary: {
        summaryDE: contentRecord.summary.de,
        summaryEN: contentRecord.summary.en,
        summaryES: contentRecord.summary.es,
      },
      description: {
        descriptionDE: contentRecord.description.de,
        descriptionEN: contentRecord.description.en,
        descriptionES: contentRecord.description.es,
      },
      locationLabel: {
        locationLabelDE: contentRecord.locationLabel.de,
        locationLabelEN: contentRecord.locationLabel.en,
        locationLabelES: contentRecord.locationLabel.es,
      },
      locationDescription: {
        locationDescriptionDE: contentRecord.locationDescription.de,
        locationDescriptionEN: contentRecord.locationDescription.en,
        locationDescriptionES: contentRecord.locationDescription.es,
      },
      directions: {
        directionsDE: contentRecord.directions.de,
        directionsEN: contentRecord.directions.en,
        directionsES: contentRecord.directions.es,
      },
      houseRules: {
        houseRulesDE: contentRecord.houseRules.de,
        houseRulesEN: contentRecord.houseRules.en,
        houseRulesES: contentRecord.houseRules.es,
      },
      heroImageUrl: contentRecord.heroImage,
      galleryUrls: contentRecord.gallery.map((url) => ({ url })),
      bedrooms: contentRecord.bedrooms,
      bathrooms: contentRecord.bathrooms,
      maxGuests: contentRecord.maxGuests,
      pricing: {
        nightly: contentRecord.pricing?.nightly,
        cleaningFee: contentRecord.pricing?.cleaningFee,
        taxes: contentRecord.pricing?.taxes,
        taxPercentage: contentRecord.pricing?.taxPercentage,
        taxPersonNight: contentRecord.pricing?.taxPersonNight,
        minStay: contentRecord.pricing?.minStay,
      },
      lastSyncedAt: contentRecord.lastSyncedAt,
      raw: contentRecord.raw,
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

  const staleKeys = [...existingByKey.keys()].filter((key) => !seenKeys.has(key));
  for (const key of staleKeys) {
    const existingDoc = existingByKey.get(key);
    if (!existingDoc?.id) continue;
    await payload.delete({
      collection: 'beds24-property-content',
      id: String(existingDoc.id),
    });
  }

  clearRemembered('cms:properties');
  clearRemembered('cms:locations');

  return {
    created,
    updated,
    skipped,
    deleted: staleKeys,
    syncedAt: new Date().toISOString(),
  };
}
