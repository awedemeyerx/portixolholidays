import { fetchBeds24Calendar, isBeds24Configured } from '../beds24/client';
import { clearRemembered, remember } from '../cache/memory';
import { diffNights, enumerateNights, roundMoney } from '../dates';
import type { CalendarDay, CalendarSnapshot, PriceBreakdown, PropertyRecord, SearchQuery } from '../types';
import { getPayloadClient } from '@/lib/payload';
import { getProperties } from './cms';

type RawDoc = Record<string, unknown>;

type SyncInventoryOptions = {
  roomIds?: number[];
  propertyIds?: number[];
};

const SNAPSHOT_TTL_MS = 30_000;

function normalizeDay(value: unknown, property: PropertyRecord): CalendarDay | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as RawDoc;
  const numAvail = Number(record.numAvail ?? (record.available === false ? 0 : 1));
  const minStay = Number(record.minStay ?? property.pricing.minStay);
  const priceValue = Number(record.price ?? record.price1 ?? property.pricing.nightly);

  return {
    available: typeof record.available === 'boolean' ? record.available : numAvail > 0,
    numAvail: Number.isFinite(numAvail) ? numAvail : 0,
    minStay: Number.isFinite(minStay) && minStay > 0 ? minStay : property.pricing.minStay,
    price: Number.isFinite(priceValue) ? priceValue : property.pricing.nightly,
    closedArrival: Boolean(record.closedArrival),
    closedDeparture: Boolean(record.closedDeparture),
  };
}

function normalizeSnapshotDoc(doc: RawDoc, property: PropertyRecord): CalendarSnapshot {
  const rawDays = doc.days && typeof doc.days === 'object' ? (doc.days as RawDoc) : {};
  const days = Object.entries(rawDays).reduce<CalendarSnapshot['days']>((accumulator, [key, value]) => {
    const day = normalizeDay(value, property);
    if (day) {
      accumulator[key] = day;
    }
    return accumulator;
  }, {});

  return {
    roomId: Number(doc.beds24RoomId ?? property.beds24RoomId),
    propertyId: Number(doc.beds24PropertyId ?? property.beds24PropertyId),
    generatedAt: String(doc.generatedAt ?? ''),
    lastSyncedAt: String(doc.lastSyncedAt ?? ''),
    from: String(doc.from ?? ''),
    to: String(doc.to ?? ''),
    source:
      String(doc.source ?? 'beds24') === 'fallback'
        ? 'fallback'
        : 'database',
    days,
    raw: (doc.raw as RawDoc | undefined) ?? undefined,
  };
}

function payloadSnapshotData(property: PropertyRecord, snapshot: CalendarSnapshot) {
  return {
    internalName: property.title.de || property.title.en || property.title.es || String(property.beds24PropertyId),
    beds24PropertyId: property.beds24PropertyId,
    beds24RoomId: property.beds24RoomId,
    from: snapshot.from ?? '',
    to: snapshot.to ?? '',
    source: snapshot.source === 'fallback' ? 'fallback' : 'beds24',
    generatedAt: snapshot.generatedAt,
    lastSyncedAt: snapshot.lastSyncedAt ?? snapshot.generatedAt,
    days: snapshot.days,
    raw: snapshot.raw ?? null,
  };
}

async function findSnapshotDoc(roomId: number) {
  const [doc] = await findSnapshotDocs([roomId]);
  return doc ?? null;
}

async function findSnapshotDocs(roomIds: number[]) {
  const uniqueRoomIds = Array.from(new Set(roomIds.filter((value) => Number.isFinite(value) && value > 0)));
  if (uniqueRoomIds.length === 0) return [];

  const payload = await getPayloadClient();
  if (!payload) return [];

  return remember(`inventory-snapshots:${uniqueRoomIds.slice().sort((a, b) => a - b).join(',')}`, SNAPSHOT_TTL_MS, async () => {
    const result = await payload.find({
      collection: 'beds24-inventory-snapshots',
      limit: uniqueRoomIds.length,
      where: {
        or: uniqueRoomIds.map((roomId) => ({
          beds24RoomId: {
            equals: roomId,
          },
        })),
      },
    });

    return result.docs as unknown as RawDoc[];
  });
}

async function upsertInventorySnapshot(property: PropertyRecord, snapshot: CalendarSnapshot) {
  const payload = await getPayloadClient();
  if (!payload) {
    return snapshot;
  }

  const existing = await findSnapshotDoc(property.beds24RoomId);
  const data = payloadSnapshotData(property, snapshot);

  if (existing?.id) {
    await payload.update({
      collection: 'beds24-inventory-snapshots',
      id: String(existing.id),
      data,
    });
  } else {
    await payload.create({
      collection: 'beds24-inventory-snapshots',
      data,
    });
  }

  clearRemembered('inventory-snapshots:');

  return snapshot;
}

function uniqueProperties(properties: PropertyRecord[]) {
  return Array.from(
    new Map(
      properties
        .filter((property) => property.beds24PropertyId > 0 && property.beds24RoomId > 0)
        .map((property) => [property.beds24RoomId, property]),
    ).values(),
  );
}

async function syncInventorySnapshotForProperty(property: PropertyRecord) {
  const snapshot = await fetchBeds24Calendar(property);
  const persisted = {
    ...snapshot,
    lastSyncedAt: new Date().toISOString(),
  } satisfies CalendarSnapshot;

  await upsertInventorySnapshot(property, persisted);
  return persisted;
}

export async function syncBeds24InventorySnapshots(options: SyncInventoryOptions = {}) {
  const properties = uniqueProperties(await getProperties()).filter((property) => {
    const propertyMatch = !options.propertyIds?.length || options.propertyIds.includes(property.beds24PropertyId);
    const roomMatch = !options.roomIds?.length || options.roomIds.includes(property.beds24RoomId);
    return propertyMatch && roomMatch;
  });

  if (properties.length === 0) {
    return {
      created: [] as string[],
      updated: [] as string[],
      failed: [] as Array<{ key: string; error: string }>,
      syncedAt: new Date().toISOString(),
    };
  }

  const created: string[] = [];
  const updated: string[] = [];
  const failed: Array<{ key: string; error: string }> = [];

  for (const property of properties) {
    const key = `${property.beds24PropertyId}:${property.beds24RoomId}`;
    try {
      const existing = await findSnapshotDoc(property.beds24RoomId);
      await syncInventorySnapshotForProperty(property);
      if (existing?.id) {
        updated.push(key);
      } else {
        created.push(key);
      }
    } catch (error) {
      failed.push({
        key,
        error: error instanceof Error ? error.message : 'Inventory sync failed.',
      });
    }
  }

  return {
    created,
    updated,
    failed,
    syncedAt: new Date().toISOString(),
  };
}

export async function getInventorySnapshot(property: PropertyRecord) {
  const payload = await getPayloadClient();
  if (!payload) {
    return fetchBeds24Calendar(property);
  }

  const existing = await findSnapshotDoc(property.beds24RoomId);
  if (existing) {
    return normalizeSnapshotDoc(existing, property);
  }

  if (!isBeds24Configured()) {
    return fetchBeds24Calendar(property);
  }

  return syncInventorySnapshotForProperty(property);
}

export async function getInventorySnapshots(properties: PropertyRecord[]) {
  const propertyMap = new Map(properties.map((property) => [property.beds24RoomId, property]));
  const docs = await findSnapshotDocs(properties.map((property) => property.beds24RoomId));
  const snapshots = new Map<number, CalendarSnapshot>();

  for (const doc of docs) {
    const roomId = Number(doc.beds24RoomId ?? 0);
    const property = propertyMap.get(roomId);
    if (!property) continue;
    snapshots.set(roomId, normalizeSnapshotDoc(doc, property));
  }

  const missingProperties = properties.filter((property) => !snapshots.has(property.beds24RoomId));
  for (const property of missingProperties) {
    const snapshot = await getInventorySnapshot(property);
    snapshots.set(property.beds24RoomId, snapshot);
  }

  return snapshots;
}

export function quoteFromInventorySnapshot(property: PropertyRecord, query: SearchQuery, snapshot: CalendarSnapshot) {
  if (query.guests > property.maxGuests) return null;

  const nights = diffNights(query.checkIn, query.checkOut);
  if (nights <= 0) return null;

  const arrivalDay = snapshot.days[query.checkIn];
  const departureDay = snapshot.days[query.checkOut];

  if (!arrivalDay || !departureDay) return null;
  if (arrivalDay.closedArrival) return null;
  if (departureDay.closedDeparture) return null;
  if (nights < arrivalDay.minStay) return null;

  const nightlyKeys = enumerateNights(query.checkIn, query.checkOut);
  const nightlyPrices: number[] = [];

  for (const nightKey of nightlyKeys) {
    const day = snapshot.days[nightKey];
    if (!day || !day.available) {
      return null;
    }
    nightlyPrices.push(day.price ?? property.pricing.nightly);
  }

  const subtotal = roundMoney(nightlyPrices.reduce((sum, price) => sum + price, 0));
  const averageNightlyPrice = roundMoney(subtotal / Math.max(nightlyPrices.length, 1));
  const cleaningFee = roundMoney(property.pricing.cleaningFee);
  const taxes =
    property.pricing.taxPercentage && property.pricing.taxPercentage > 0
      ? roundMoney((subtotal * property.pricing.taxPercentage) / 100)
      : property.pricing.taxPersonNight && property.pricing.taxPersonNight > 0
        ? roundMoney(property.pricing.taxPersonNight * query.guests * nights)
        : roundMoney(property.pricing.taxes);
  const totalPrice = roundMoney(subtotal + cleaningFee + taxes);

  const quote: PriceBreakdown = {
    currency: property.pricing.currency,
    nights,
    pricePerNight: averageNightlyPrice,
    subtotal,
    cleaningFee,
    taxes,
    totalPrice,
    depositAmount: roundMoney(totalPrice * property.pricing.depositRate),
  };

  return {
    quote,
    arrivalDay,
    departureDay,
  };
}
