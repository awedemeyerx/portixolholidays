import { getPayloadClient } from '@/lib/payload';
import { fetchBeds24Offers, isBeds24Configured } from '../beds24/client';
import { clearRemembered, remember } from '../cache/memory';
import { diffNights } from '../dates';
import type { Beds24Offer, PriceBreakdown, PropertyRecord, SearchQuery } from '../types';

type RawDoc = Record<string, unknown>;

const OFFER_TTL_MS = 30 * 60 * 1000;

function cacheKey(roomId: number, query: SearchQuery) {
  return `${roomId}:${query.checkIn}:${query.checkOut}:${query.guests}`;
}

function toIsoDate(value: string) {
  return `${value}T00:00:00.000Z`;
}

function isFresh(expiresAt: string) {
  return new Date(expiresAt).getTime() > Date.now();
}

function mapOfferDoc(doc: RawDoc): Beds24Offer {
  if (doc.raw && typeof doc.raw === 'object') {
    const raw = doc.raw as RawDoc;
    return {
      roomId: Number(raw.roomId ?? doc.beds24RoomId ?? 0),
      available: typeof raw.available === 'boolean' ? raw.available : Boolean(doc.available),
      pricePerNight: Number(raw.pricePerNight ?? 0),
      cleaningFee: Number(raw.cleaningFee ?? 0),
      taxes: Number(raw.taxes ?? 0),
      totalPrice: Number(raw.totalPrice ?? doc.totalPrice ?? 0),
      currency: String(raw.currency ?? doc.currency ?? 'EUR'),
      minimumStay: Number(raw.minimumStay ?? 1),
    };
  }

  return {
    roomId: Number(doc.beds24RoomId ?? 0),
    available: Boolean(doc.available),
    pricePerNight: 0,
    cleaningFee: 0,
    taxes: 0,
    totalPrice: Number(doc.totalPrice ?? 0),
    currency: String(doc.currency ?? 'EUR'),
    minimumStay: 1,
  };
}

async function findOfferDocs(query: SearchQuery, roomIds: number[]) {
  const payload = await getPayloadClient();
  if (!payload) return [];
  const uniqueRoomIds = Array.from(new Set(roomIds.filter((value) => value > 0)));
  if (uniqueRoomIds.length === 0) return [];

  return remember(
    `offers:${query.checkIn}:${query.checkOut}:${query.guests}:${uniqueRoomIds.slice().sort((a, b) => a - b).join(',')}`,
    15_000,
    async () => {
      const result = await payload.find({
        collection: 'beds24-offer-cache',
        limit: uniqueRoomIds.length,
        where: {
          and: [
            { checkIn: { equals: toIsoDate(query.checkIn) } },
            { checkOut: { equals: toIsoDate(query.checkOut) } },
            { guests: { equals: query.guests } },
            {
              or: uniqueRoomIds.map((roomId) => ({
                beds24RoomId: { equals: roomId },
              })),
            },
          ],
        },
      });

      return result.docs as unknown as RawDoc[];
    },
  );
}

async function upsertOfferDoc(property: PropertyRecord, query: SearchQuery, offer: Beds24Offer) {
  const payload = await getPayloadClient();
  if (!payload) return;

  const key = cacheKey(property.beds24RoomId, query);
  const existing = await payload.find({
    collection: 'beds24-offer-cache',
    limit: 1,
    where: {
      cacheKey: {
        equals: key,
      },
    },
  });

  const data = {
    cacheKey: key,
    beds24PropertyId: property.beds24PropertyId,
    beds24RoomId: property.beds24RoomId,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: query.guests,
    available: offer.available,
    totalPrice: offer.totalPrice,
    currency: offer.currency,
    lastSyncedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + OFFER_TTL_MS).toISOString(),
    raw: offer,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: 'beds24-offer-cache',
      id: String((existing.docs[0] as RawDoc).id),
      data,
    });
  } else {
    await payload.create({
      collection: 'beds24-offer-cache',
      data,
    });
  }
}

export async function getBeds24OfferMap(query: SearchQuery, properties: PropertyRecord[]) {
  const roomIds = properties.map((property) => property.beds24RoomId);
  const docs = await findOfferDocs(query, roomIds);
  const offers = new Map<number, Beds24Offer>();
  const missingRoomIds = new Set<number>(roomIds);

  for (const doc of docs) {
    const offer = mapOfferDoc(doc);
    const expiresAt = String(doc.expiresAt ?? '');
    if (!isFresh(expiresAt)) {
      continue;
    }
    offers.set(offer.roomId, offer);
    missingRoomIds.delete(offer.roomId);
  }

  if (!isBeds24Configured() || missingRoomIds.size === 0) {
    return offers;
  }

  const missingProperties = properties.filter((property) => missingRoomIds.has(property.beds24RoomId));
  let liveOffers: Beds24Offer[] = [];
  try {
    liveOffers = await fetchBeds24Offers(query, missingProperties.map((property) => property.beds24RoomId));
  } catch {
    return offers;
  }

  for (const property of missingProperties) {
    const offer = liveOffers.find((entry) => entry.roomId === property.beds24RoomId);
    if (!offer) continue;
    offers.set(property.beds24RoomId, offer);
    await upsertOfferDoc(property, query, offer);
  }

  clearRemembered('offers:');

  return offers;
}

export function toPriceBreakdownFromOffer(property: PropertyRecord, query: SearchQuery, offer: Beds24Offer): PriceBreakdown {
  const nights = diffNights(query.checkIn, query.checkOut);
  const subtotal = Math.max(offer.totalPrice, 0);
  const cleaningFee = Math.max(offer.cleaningFee, 0);
  const taxes = Math.max(offer.taxes, 0);
  const totalPrice = subtotal + cleaningFee + taxes;
  const pricePerNight =
    offer.pricePerNight > 0 ? Math.round(offer.pricePerNight) : nights > 0 ? Math.round(subtotal / nights) : subtotal;

  return {
    currency: offer.currency || property.pricing.currency,
    nights,
    pricePerNight,
    subtotal,
    cleaningFee,
    taxes,
    totalPrice,
    depositAmount: Math.round(totalPrice * property.pricing.depositRate),
  };
}
