import type { Beds24Offer, BookingSessionRecord, CalendarSnapshot, PropertyRecord, SearchQuery } from '../types';
import { addDays, diffNights, enumerateNights, toDateKey } from '../dates';

type Beds24TokenState = {
  token: string;
  expiresAt: number;
};

let tokenState: Beds24TokenState | null = null;

const API_BASE = process.env.BEDS24_API_BASE_URL?.trim() || 'https://beds24.com/api/v2';

function beds24Headers(token: string, extra?: HeadersInit) {
  return {
    accept: 'application/json',
    token,
    ...extra,
  };
}

export function isBeds24Configured() {
  return Boolean(process.env.BEDS24_TOKEN?.trim() || process.env.BEDS24_REFRESH_TOKEN?.trim());
}

async function getBeds24Token() {
  const directToken = process.env.BEDS24_TOKEN?.trim();
  if (directToken) return directToken;

  if (tokenState && tokenState.expiresAt > Date.now() + 60_000) {
    return tokenState.token;
  }

  const refreshToken = process.env.BEDS24_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    throw new Error('Beds24 credentials are not configured.');
  }

  const response = await fetch(`${API_BASE}/authentication/token`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      refreshToken,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Beds24 token refresh failed with status ${response.status}.`);
  }

  const data = (await response.json()) as { token?: string; expiresIn?: number };
  if (!data.token) {
    throw new Error('Beds24 token refresh did not return a token.');
  }

  tokenState = {
    token: data.token,
    expiresAt: Date.now() + (data.expiresIn ?? 3600) * 1000,
  };

  return data.token;
}

async function beds24Request<T>(
  pathname: string,
  {
    method = 'GET',
    searchParams,
    body,
  }: { method?: 'GET' | 'POST'; searchParams?: Record<string, string>; body?: unknown } = {},
) {
  const token = await getBeds24Token();
  const url = new URL(`${API_BASE}${pathname}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url, {
    method,
    headers: beds24Headers(token, body ? { 'content-type': 'application/json' } : undefined),
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Beds24 ${pathname} failed (${response.status}): ${message}`);
  }

  return (await response.json()) as T;
}

function normalizeOfferEntry(raw: Record<string, unknown>): Beds24Offer | null {
  const roomId = Number(raw.roomId ?? raw.id ?? raw.room_id ?? 0);
  if (!roomId) return null;

  const totalPrice = Number(
    raw.totalPrice ?? raw.total ?? raw.price ?? raw.amount ?? raw.grandTotal ?? raw.price1 ?? 0,
  );
  const pricePerNight = Number(raw.pricePerNight ?? raw.nightlyPrice ?? raw.price1 ?? totalPrice);
  const cleaningFee = Number(raw.cleaningFee ?? raw.cleaning ?? 0);
  const taxes = Number(raw.taxes ?? raw.tax ?? 0);
  const minimumStay = Number(raw.minStay ?? raw.minimumStay ?? 1);
  const available =
    typeof raw.available === 'boolean'
      ? raw.available
      : typeof raw.bookable === 'boolean'
        ? raw.bookable
        : totalPrice > 0;

  return {
    roomId,
    available,
    totalPrice,
    pricePerNight,
    cleaningFee,
    taxes,
    minimumStay,
    currency: String(raw.currency ?? 'EUR'),
  };
}

function flattenEntries(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenEntries(item));
  }
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    if (Object.keys(objectValue).some((key) => ['roomId', 'price', 'totalPrice', 'pricePerNight'].includes(key))) {
      return [objectValue];
    }
    return Object.values(objectValue).flatMap((item) => flattenEntries(item));
  }
  return [];
}

export async function fetchBeds24Offers(query: SearchQuery, roomIds: number[]) {
  const raw = await beds24Request<unknown>('/inventory/rooms/offers', {
    searchParams: {
      roomId: roomIds.join(','),
      from: query.checkIn,
      to: query.checkOut,
      numAdult: String(query.guests),
    },
  });

  const entries = flattenEntries(raw);
  return entries.map(normalizeOfferEntry).filter(Boolean) as Beds24Offer[];
}

export async function fetchBeds24PropertyCatalog() {
  return beds24Request<unknown>('/properties', {
    searchParams: {
      includeAllRooms: 'true',
    },
  });
}

export async function fetchBeds24Availability(query: SearchQuery, roomId: number) {
  const raw = await beds24Request<unknown>('/inventory/rooms/availability', {
    searchParams: {
      roomId: String(roomId),
      from: query.checkIn,
      to: query.checkOut,
      numAdult: String(query.guests),
    },
  });

  const availability =
    (raw as { availability?: Record<string, boolean> }).availability ??
    (raw as { data?: { availability?: Record<string, boolean> }[] }).data?.[0]?.availability ??
    {};

  const nights = enumerateNights(query.checkIn, query.checkOut);
  return nights.every((night) => availability[night] !== false);
}

function buildFallbackCalendar(property: PropertyRecord) {
  const today = new Date();
  const days: CalendarSnapshot['days'] = {};
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const key = toDateKey(date);
    const isBlocked = property.blockedRanges.some((range) => key >= range.from && key < range.to);
    days[key] = {
      available: !isBlocked,
      minStay: property.pricing.minStay,
      price: property.pricing.nightly,
    };
  }
  return days;
}

export async function fetchBeds24Calendar(property: PropertyRecord): Promise<CalendarSnapshot> {
  if (!isBeds24Configured()) {
    return {
      roomId: property.beds24RoomId,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      days: buildFallbackCalendar(property),
    };
  }

  const from = toDateKey(new Date());
  const to = addDays(from, 365);
  const raw = await beds24Request<unknown>('/inventory/rooms/calendar', {
    searchParams: {
      roomId: String(property.beds24RoomId),
      from,
      to,
    },
  });

  const entries = flattenEntries(raw);
  const days: CalendarSnapshot['days'] = {};

  entries.forEach((entry) => {
    const day = String(entry.date ?? entry.from ?? '');
    if (!day) return;
    const minStay = Number(entry.minStay ?? property.pricing.minStay);
    const price = Number(entry.price1 ?? entry.price ?? property.pricing.nightly);
    const available =
      typeof entry.available === 'boolean'
        ? entry.available
        : typeof entry.bookable === 'boolean'
          ? entry.bookable
          : !Boolean(entry.closed);

    days[day] = {
      available,
      minStay,
      price,
    };
  });

  if (Object.keys(days).length === 0) {
    return {
      roomId: property.beds24RoomId,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      days: buildFallbackCalendar(property),
    };
  }

  return {
    roomId: property.beds24RoomId,
    generatedAt: new Date().toISOString(),
    source: 'beds24',
    days,
  };
}

export async function createBeds24Booking(session: BookingSessionRecord) {
  const body = [
    {
      propertyId: session.beds24PropertyId,
      roomId: session.beds24RoomId,
      apiReference: session.id,
      arrival: session.query.checkIn,
      departure: session.query.checkOut,
      numAdult: session.query.guests,
      firstName: session.guest.firstName,
      lastName: session.guest.lastName,
      email: session.guest.email,
      mobile: session.guest.phone,
      comments: session.guest.notes || '',
      referer: 'Portixol Holidays',
      status: 'confirmed',
    },
  ];

  const raw = await beds24Request<unknown>('/bookings', {
    method: 'POST',
    body,
  });

  const entries = flattenEntries(raw);
  const bookingId = entries.find((entry) => entry.id || entry.bookingId || entry.new)?.id;
  return String(bookingId ?? session.id);
}

export function fallbackOffer(property: PropertyRecord, query: SearchQuery): Beds24Offer {
  const nights = diffNights(query.checkIn, query.checkOut);
  const nightly = property.pricing.nightly + (query.guests > 4 ? 20 : 0);
  const subtotal = nightly * nights;
  return {
    roomId: property.beds24RoomId,
    available: true,
    pricePerNight: nightly,
    cleaningFee: property.pricing.cleaningFee,
    taxes: property.pricing.taxes,
    totalPrice: subtotal + property.pricing.cleaningFee + property.pricing.taxes,
    minimumStay: property.pricing.minStay,
    currency: property.pricing.currency,
  };
}
