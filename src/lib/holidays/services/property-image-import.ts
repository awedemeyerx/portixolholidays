import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getPayloadClient } from '@/lib/payload';
import { getProperties } from './cms';
import type { PropertyImageImportItem, PropertyImageImportResult, PropertyRecord } from '../types';

type RawDoc = Record<string, unknown>;

function toKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function pickDocUrl(doc: RawDoc) {
  const url = doc.url;
  if (typeof url === 'string' && url.trim()) return url;
  const thumbnailURL = doc.thumbnailURL;
  if (typeof thumbnailURL === 'string' && thumbnailURL.trim()) return thumbnailURL;
  return '';
}

function normalizeUrls(urls: string[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter((url) => /^https?:\/\//i.test(url)),
    ),
  );
}

function extensionFromUrl(url: string, contentType: string | null) {
  const pathname = new URL(url).pathname;
  const parsed = path.extname(pathname).toLowerCase();
  if (parsed) return parsed;
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('gif')) return '.gif';
  return '.jpg';
}

async function downloadImage(url: string, sourceKey: string, index: number) {
  const response = await fetch(url, {
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Image download failed for ${url}: ${response.status}`);
  }

  const fileName = `${sourceKey}-${String(index + 1).padStart(2, '0')}${extensionFromUrl(url, response.headers.get('content-type'))}`;
  const filePath = path.join(os.tmpdir(), fileName);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return filePath;
}

async function findPropertyByImport(item: PropertyImageImportItem) {
  const properties = await getProperties();

  const byIds = properties.find((property) => {
    const propertyMatch = !item.beds24PropertyId || property.beds24PropertyId === item.beds24PropertyId;
    const roomMatch = !item.beds24RoomId || property.beds24RoomId === item.beds24RoomId;
    return propertyMatch && roomMatch;
  });
  if (byIds) return byIds;

  if (item.propertySlug) {
    const slug = item.propertySlug.trim().toLowerCase();
    const bySlug = properties.find((property) => Object.values(property.slugs).some((value) => value.trim().toLowerCase() === slug));
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

async function findDocByBeds24(payload: NonNullable<Awaited<ReturnType<typeof getPayloadClient>>>, collection: 'beds24-property-content' | 'properties', property: PropertyRecord) {
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

async function ensureMediaDoc(
  payload: NonNullable<Awaited<ReturnType<typeof getPayloadClient>>>,
  url: string,
  sourceKey: string,
  alt: string,
  index: number,
) {
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: {
      sourceUrl: {
        equals: url,
      },
    },
  });

  const existingDoc = existing.docs[0] as RawDoc | undefined;
  if (existingDoc) {
    return {
      id: String(existingDoc.id),
      url: pickDocUrl(existingDoc),
    };
  }

  const filePath = await downloadImage(url, sourceKey, index);

  try {
    const created = (await payload.create({
      collection: 'media',
      data: {
        alt,
        caption: sourceKey,
        sourceUrl: url,
        sourceKey,
      },
      filePath,
      overwriteExistingFiles: true,
    })) as RawDoc;

    return {
      id: String(created.id),
      url: pickDocUrl(created),
    };
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
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
        summaryDE: property.summary.de,
        summaryEN: property.summary.en,
        summaryES: property.summary.es,
      },
      description: {
        descriptionDE: property.description.de,
        descriptionEN: property.description.en,
        descriptionES: property.description.es,
      },
      locationLabel: {
        locationLabelDE: property.locationLabel.de,
        locationLabelEN: property.locationLabel.en,
        locationLabelES: property.locationLabel.es,
      },
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      heroImageUrl: property.heroImage,
      galleryUrls: property.gallery.map((url) => ({ url })),
      lastSyncedAt: new Date().toISOString(),
    },
  })) as RawDoc;
}

export async function importPropertyImages(items: PropertyImageImportItem[]): Promise<PropertyImageImportResult[]> {
  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error('Payload CMS is not configured.');
  }

  const results: PropertyImageImportResult[] = [];

  for (const item of items) {
    const property = await findPropertyByImport(item);
    if (!property) {
      throw new Error(`No property match found for import target ${item.propertySlug ?? item.internalName ?? item.beds24PropertyId ?? 'unknown'}.`);
    }

    const imageUrls = normalizeUrls(item.imageUrls);
    if (imageUrls.length === 0) {
      throw new Error(`No valid image URLs found for ${property.id}.`);
    }

    const heroIndex = Math.min(Math.max(item.heroIndex ?? 0, 0), imageUrls.length - 1);
    const sourceKey = [
      `p${property.beds24PropertyId}`,
      `r${property.beds24RoomId}`,
      toKeyPart(property.title.de || property.title.en || property.title.es || property.id),
    ].join('-');
    const alt = property.title.de || property.title.en || property.title.es || property.id;

    const mediaDocs = [];
    for (const [index, url] of imageUrls.entries()) {
      mediaDocs.push(await ensureMediaDoc(payload, url, sourceKey, alt, index));
    }

    const heroDoc = mediaDocs[heroIndex];
    const beds24ContentDoc = await ensureBeds24ContentDoc(payload, property);
    await payload.update({
      collection: 'beds24-property-content',
      id: String(beds24ContentDoc.id),
      data: {
        heroImageUrl: heroDoc.url,
        galleryUrls: mediaDocs.map((doc) => ({ url: doc.url })),
        lastSyncedAt: new Date().toISOString(),
      },
    });

    const propertyDoc = await findDocByBeds24(payload, 'properties', property);
    if (propertyDoc?.id) {
      await payload.update({
        collection: 'properties',
        id: String(propertyDoc.id),
        data: {
          heroImage: heroDoc.id,
          gallery: mediaDocs.map((doc) => ({ image: doc.id })),
        },
      });
    }

    results.push({
      propertyKey: property.id,
      imported: mediaDocs.length,
      heroImageUrl: heroDoc.url,
      galleryUrls: mediaDocs.map((doc) => doc.url),
      target: {
        beds24PropertyId: property.beds24PropertyId,
        beds24RoomId: property.beds24RoomId,
        internalName: property.title.de || property.title.en || property.title.es || property.id,
      },
    });
  }

  return results;
}
