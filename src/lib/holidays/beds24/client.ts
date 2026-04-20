import type { Beds24Offer, BookingSessionRecord, CalendarSnapshot, Locale, PropertyRecord, SearchQuery } from '../types';
import { addDays, diffNights, enumerateNights, formatMoney, parseDate, roundMoney, toDateKey } from '../dates';

type RawDoc = Record<string, unknown>;

type Beds24CalendarEntry = {
  from: string;
  to: string;
  numAvail?: number;
  minStay?: number;
  price1?: number;
  closedArrival?: boolean;
  closedDeparture?: boolean;
};

type Beds24TokenState = {
  token: string;
  expiresAt: number;
};

type Beds24SearchParamValue = string | number | boolean | Array<string | number | boolean>;

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
  }: { method?: 'GET' | 'POST'; searchParams?: Record<string, Beds24SearchParamValue>; body?: unknown } = {},
) {
  const token = await getBeds24Token();
  const url = new URL(`${API_BASE}${pathname}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item));
        });
        return;
      }

      url.searchParams.set(key, String(value));
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

async function beds24RequestByLink<T>(ref: string) {
  const token = await getBeds24Token();
  const response = await fetch(ref, {
    method: 'GET',
    headers: beds24Headers(token),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Beds24 request failed (${response.status}): ${message}`);
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

function normalizeOfferDataEntry(raw: Record<string, unknown>): Beds24Offer | null {
  const roomId = Number(raw.roomId ?? raw.id ?? raw.room_id ?? 0);
  if (!roomId) return null;

  const offer = Array.isArray(raw.offers) && raw.offers.length > 0 && raw.offers[0] && typeof raw.offers[0] === 'object'
    ? (raw.offers[0] as Record<string, unknown>)
    : null;

  if (!offer) return null;

  const totalPrice = Number(offer.price ?? offer.totalPrice ?? offer.total ?? 0);
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return null;

  const cleaningFee = Number(offer.cleaningFee ?? offer.cleaning ?? offer.feeCleaning ?? raw.cleaningFee ?? 0);
  const taxes = Number(offer.taxes ?? offer.tax ?? offer.taxTotal ?? raw.taxes ?? raw.tax ?? 0);
  const pricePerNight = Number(offer.pricePerNight ?? offer.nightlyPrice ?? offer.avgPrice ?? offer.averagePrice ?? 0);
  const minimumStay = Number(offer.minStay ?? offer.minimumStay ?? raw.minStay ?? 1);
  const unitsAvailable = Number(offer.unitsAvailable ?? raw.unitsAvailable ?? 0);

  return {
    roomId,
    available: unitsAvailable > 0,
    totalPrice,
    pricePerNight,
    cleaningFee,
    taxes,
    minimumStay,
    currency: String(offer.currency ?? raw.currency ?? 'EUR'),
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
      roomId: roomIds,
      arrival: query.checkIn,
      departure: query.checkOut,
      numAdults: String(query.guests),
    },
  });

  const dataEntries = Array.isArray((raw as { data?: unknown[] }).data)
    ? ((raw as { data?: unknown[] }).data as Record<string, unknown>[])
    : [];

  const normalizedFromData = dataEntries.map(normalizeOfferDataEntry).filter(Boolean) as Beds24Offer[];
  if (normalizedFromData.length > 0) {
    return normalizedFromData;
  }

  const entries = flattenEntries(raw);
  return entries.map(normalizeOfferEntry).filter(Boolean) as Beds24Offer[];
}

export async function fetchBeds24PropertyCatalog(options?: {
  ids?: number[];
  includeAllRooms?: boolean;
  includeLanguages?: string[];
  includeTexts?: string[];
  includePictures?: boolean;
  includeOffers?: boolean;
  includePriceRules?: boolean;
}) {
  return beds24Request<unknown>('/properties', {
    searchParams: {
      ...(options?.ids?.length ? { id: options.ids } : {}),
      includeAllRooms: options?.includeAllRooms ?? true,
      ...(options?.includeLanguages?.length ? { includeLanguages: options.includeLanguages } : {}),
      ...(options?.includeTexts?.length ? { includeTexts: options.includeTexts } : {}),
      ...(typeof options?.includePictures === 'boolean' ? { includePictures: options.includePictures } : {}),
      ...(typeof options?.includeOffers === 'boolean' ? { includeOffers: options.includeOffers } : {}),
      ...(typeof options?.includePriceRules === 'boolean' ? { includePriceRules: options.includePriceRules } : {}),
    },
  });
}

async function fetchBeds24AvailabilityMap(roomId: number) {
  const raw = await beds24Request<unknown>('/inventory/rooms/availability', {
    searchParams: {
      roomId: String(roomId),
    },
  });

  return (
    (raw as { availability?: Record<string, boolean> }).availability ??
    (raw as { data?: { availability?: Record<string, boolean> }[] }).data?.[0]?.availability ??
    {}
  );
}

export async function fetchBeds24Availability(query: SearchQuery, roomId: number) {
  const availability = await fetchBeds24AvailabilityMap(roomId);
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
      numAvail: isBlocked ? 0 : 1,
      minStay: property.pricing.minStay,
      price: property.pricing.nightly,
      closedArrival: isBlocked,
      closedDeparture: false,
    };
  }
  return days;
}

export async function fetchBeds24Calendar(property: PropertyRecord): Promise<CalendarSnapshot> {
  if (!isBeds24Configured()) {
    return {
      roomId: property.beds24RoomId,
      propertyId: property.beds24PropertyId,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      from: toDateKey(new Date()),
      to: addDays(toDateKey(new Date()), 364),
      days: buildFallbackCalendar(property),
    };
  }

  const todayKey = toDateKey(new Date());
  const horizonEnd = addDays(todayKey, 364);
  const ranges: Beds24CalendarEntry[] = [];

  let response = await beds24Request<{
    data?: Array<{
      roomId?: number;
      propertyId?: number;
      calendar?: RawDoc[];
    }>;
    pages?: {
      nextPageExists?: boolean;
      nextPageLink?: string | null;
    };
  }>('/inventory/rooms/calendar', {
    searchParams: {
      roomId: String(property.beds24RoomId),
      from: todayKey,
      to: horizonEnd,
      includeNumAvail: 'true',
      includePrices: 'true',
      includeMinStay: 'true',
      includeClosedArrival: 'true',
      includeClosedDeparture: 'true',
    },
  });

  for (;;) {
    const record = response.data?.find((entry) => Number(entry.roomId ?? 0) === property.beds24RoomId);
    const calendarEntries = Array.isArray(record?.calendar) ? record.calendar : [];
    ranges.push(
      ...calendarEntries.map((entry) => ({
        from: String(entry.from ?? ''),
        to: String(entry.to ?? ''),
        numAvail: Number(entry.numAvail ?? 0),
        minStay: Number(entry.minStay ?? property.pricing.minStay),
        price1: Number(entry.price1 ?? property.pricing.nightly),
        closedArrival: Boolean(entry.closedArrival),
        closedDeparture: Boolean(entry.closedDeparture),
      })),
    );

    if (!response.pages?.nextPageExists || !response.pages.nextPageLink) {
      break;
    }

    response = await beds24RequestByLink<typeof response>(response.pages.nextPageLink);
  }

  if (ranges.length === 0) {
    return {
      roomId: property.beds24RoomId,
      propertyId: property.beds24PropertyId,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      from: todayKey,
      to: horizonEnd,
      days: buildFallbackCalendar(property),
    };
  }

  const days: CalendarSnapshot['days'] = {};
  for (let offset = 0; offset < 365; offset += 1) {
    const key = addDays(todayKey, offset);
    days[key] = {
      available: false,
      numAvail: 0,
      minStay: property.pricing.minStay,
      price: property.pricing.nightly,
      closedArrival: true,
      closedDeparture: false,
    };
  }

  for (const range of ranges) {
    if (!range.from || !range.to) continue;

    const endKey = range.to;
    for (
      let cursor = range.from;
      cursor <= endKey && cursor <= horizonEnd;
      cursor = addDays(cursor, 1)
    ) {
      if (cursor < todayKey) continue;
      days[cursor] = {
        available: Number.isFinite(range.numAvail) ? Number(range.numAvail) > 0 : false,
        numAvail: Number.isFinite(range.numAvail) ? Number(range.numAvail) : 0,
        minStay: Number.isFinite(range.minStay) && Number(range.minStay) > 0 ? Number(range.minStay) : property.pricing.minStay,
        price: Number.isFinite(range.price1) && Number(range.price1) >= 0 ? Number(range.price1) : property.pricing.nightly,
        closedArrival: Boolean(range.closedArrival),
        closedDeparture: Boolean(range.closedDeparture),
      };
    }
  }

  return {
    roomId: property.beds24RoomId,
    propertyId: property.beds24PropertyId,
    generatedAt: new Date().toISOString(),
    source: 'beds24',
    from: todayKey,
    to: horizonEnd,
    days,
    raw: {
      ranges,
    },
  };
}

export async function createBeds24Booking(session: BookingSessionRecord) {
  const quote = session.quote.quote;
  const accommodationAmount = roundMoney(Math.max(quote.subtotal, 0));
  const cleaningAmount = roundMoney(Math.max(quote.cleaningFee, 0));
  const tourismTaxAmount = roundMoney(Math.max(quote.taxes, 0));
  const subtotalExcludingTax = roundMoney(accommodationAmount + cleaningAmount);
  const depositAmount = roundMoney(quote.depositAmount);

  const copy = {
    de: {
      nights: 'Nächte',
      accommodation: 'Unterkunft',
      cleaning: 'Endreinigung',
      tourismTax: 'Tourismusabgabe Mallorca',
      deposit: 'Anzahlung',
      payment: 'Stripe-Zahlung',
      stayLabel: `${session.quote.title} · ${session.quote.locationLabel}`,
      cleaningDescription: `Endreinigung ${session.quote.title}`,
    },
    en: {
      nights: 'nights',
      accommodation: 'Accommodation',
      cleaning: 'Final cleaning',
      tourismTax: 'Mallorca tourist tax',
      deposit: 'Deposit',
      payment: 'Stripe payment',
      stayLabel: `${session.quote.title} · ${session.quote.locationLabel}`,
      cleaningDescription: `Final cleaning ${session.quote.title}`,
    },
    es: {
      nights: 'noches',
      accommodation: 'Alojamiento',
      cleaning: 'Limpieza final',
      tourismTax: 'Tasa turística de Mallorca',
      deposit: 'Depósito',
      payment: 'Pago por Stripe',
      stayLabel: `${session.quote.title} · ${session.quote.locationLabel}`,
      cleaningDescription: `Limpieza final ${session.quote.title}`,
    },
  } satisfies Record<
    Locale,
    {
      nights: string;
      accommodation: string;
      cleaning: string;
      tourismTax: string;
      deposit: string;
      payment: string;
      stayLabel: string;
      cleaningDescription: string;
    }
  >;

  const localized = copy[session.locale];
  const formattedArrival = new Intl.DateTimeFormat(session.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseDate(session.query.checkIn));
  const formattedDeparture = new Intl.DateTimeFormat(session.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseDate(session.query.checkOut));

  const rateDescription = [
    `${quote.nights} ${localized.nights}`,
    `${localized.accommodation} ${formatMoney(accommodationAmount, quote.currency, session.locale)}`,
  ];

  if (cleaningAmount > 0) {
    rateDescription.push(`${localized.cleaning} ${formatMoney(cleaningAmount, quote.currency, session.locale)}`);
  }

  if (tourismTaxAmount > 0) {
    rateDescription.push(`${localized.tourismTax} ${formatMoney(tourismTaxAmount, quote.currency, session.locale)}`);
  }

  rateDescription.push(`${localized.deposit} ${formatMoney(depositAmount, quote.currency, session.locale)}`);

  const invoiceItems = [
    {
      type: 'charge',
      description: `${localized.stayLabel} · ${formattedArrival} - ${formattedDeparture}`,
      status: 'Accommodation',
      qty: 1,
      amount: accommodationAmount,
      vatRate: 0,
    },
    ...(cleaningAmount > 0
      ? [
          {
            type: 'charge',
            description: localized.cleaningDescription,
            status: 'Cleaning',
            qty: 1,
            amount: cleaningAmount,
            vatRate: 0,
          },
        ]
      : []),
    ...(tourismTaxAmount > 0
      ? [
          {
            type: 'charge',
            description: localized.tourismTax,
            status: 'TourismTax',
            qty: 1,
            amount: tourismTaxAmount,
            vatRate: 0,
          },
        ]
      : []),
    ...(session.quote.quote.voucher && session.quote.quote.voucher.discountAmount > 0
      ? [
          {
            type: 'charge',
            description: `Voucher ${session.quote.quote.voucher.code}`,
            status: 'Discount',
            qty: 1,
            amount: -Math.abs(session.quote.quote.voucher.discountAmount),
            vatRate: 0,
          },
        ]
      : []),
    ...((session.stripePaymentIntentId || session.stripeSessionId) && depositAmount > 0
      ? [
          {
            type: 'payment',
            description: `${localized.payment} · ${session.guest.firstName} ${session.guest.lastName}`.trim(),
            status: 'Paid',
            qty: 1,
            amount: depositAmount,
            vatRate: 0,
          },
        ]
      : []),
  ];

  const bookingInfoItems: Array<{ code: string; text?: string }> = [{ code: 'DIRECT' }];
  if (session.stripePaymentIntentId || session.stripeSessionId) {
    bookingInfoItems.push({ code: 'STRIPE', text: session.stripePaymentIntentId ?? session.stripeSessionId ?? '' });
  }
  const appliedVoucher = session.quote.quote.voucher;
  if (appliedVoucher) {
    bookingInfoItems.push({
      code: 'VOUCHER',
      text: `${appliedVoucher.code} (-${appliedVoucher.discountAmount.toFixed(2)} ${session.quote.quote.currency})`,
    });
  }

  const voucherNote = appliedVoucher
    ? `Voucher ${appliedVoucher.code}: -${appliedVoucher.discountAmount.toFixed(2)} ${session.quote.quote.currency}`
    : '';
  const commentsParts = [session.guest.notes || '', voucherNote].filter(Boolean);

  const body = [
    {
      propertyId: session.beds24PropertyId,
      roomId: session.beds24RoomId,
      apiReference: session.id,
      reference: session.id,
      arrival: session.query.checkIn,
      departure: session.query.checkOut,
      numAdult: session.query.guests,
      lang: session.locale,
      firstName: session.guest.firstName,
      lastName: session.guest.lastName,
      email: session.guest.email,
      phone: session.guest.phone,
      mobile: session.guest.phone,
      price: subtotalExcludingTax,
      deposit: depositAmount,
      tax: 0,
      rateDescription: rateDescription.join(' · '),
      invoiceItems,
      infoItems: bookingInfoItems,
      comments: commentsParts.join(' | '),
      referer: 'Portixol Holidays',
      status: 'confirmed',
    },
  ];

  const raw = await beds24Request<unknown>('/bookings', {
    method: 'POST',
    body,
  });

  const entries = flattenEntries(raw);
  const nestedNewEntry = entries.find((entry) => typeof entry.new === 'object' && entry.new && 'id' in entry.new);
  const nestedNewId =
    nestedNewEntry && typeof nestedNewEntry.new === 'object' && nestedNewEntry.new
      ? (nestedNewEntry.new as RawDoc).id
      : undefined;
  const bookingId = entries.find((entry) => entry.id || entry.bookingId)?.id ?? nestedNewId;
  return String(bookingId ?? session.id);
}

export function fallbackOffer(property: PropertyRecord, query: SearchQuery): Beds24Offer {
  const nights = diffNights(query.checkIn, query.checkOut);
  const nightly = roundMoney(property.pricing.nightly + (query.guests > 4 ? 20 : 0));
  const subtotal = roundMoney(nightly * nights);
  return {
    roomId: property.beds24RoomId,
    available: true,
    pricePerNight: nightly,
    cleaningFee: roundMoney(property.pricing.cleaningFee),
    taxes: roundMoney(property.pricing.taxes),
    totalPrice: subtotal,
    minimumStay: property.pricing.minStay,
    currency: property.pricing.currency,
  };
}
