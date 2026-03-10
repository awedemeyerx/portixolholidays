export const LOCALES = ['de', 'en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Record<Locale, T>;

export type Highlight = {
  id: string;
  label: Localized;
};

export type PropertyPricingFallback = {
  nightly: number;
  cleaningFee: number;
  taxes: number;
  minStay: number;
  depositRate: number;
  currency: 'EUR';
};

export type BlockedRange = {
  from: string;
  to: string;
};

export type PropertyRecord = {
  id: string;
  priority: number;
  beds24PropertyId: number;
  beds24RoomId: number;
  slugs: Localized;
  title: Localized;
  summary: Localized;
  description: Localized;
  locationLabel: Localized;
  distanceLabel: Localized;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  heroImage: string;
  gallery: string[];
  highlights: Highlight[];
  amenities: Highlight[];
  houseRules: Highlight[];
  pricing: PropertyPricingFallback;
  cancellationSummary: Localized;
  seoTitle: Localized;
  seoDescription: Localized;
  blockedRanges: BlockedRange[];
};

export type Beds24ContentRecord = {
  id: string;
  beds24PropertyId: number;
  beds24RoomId: number;
  title: Localized;
  summary: Localized;
  description: Localized;
  locationLabel: Localized;
  heroImage: string;
  gallery: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  lastSyncedAt: string;
  raw?: Record<string, unknown>;
};

export type SiteSettingsRecord = {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp: string;
  depositRate: number;
  heroEyebrow: Localized;
  heroTitle: Localized;
  heroSubtitle: Localized;
  heroPrimaryCta: Localized;
  heroSecondaryCta: Localized;
  searchHint: Localized;
  searchEmptyTitle: Localized;
  searchEmptyBody: Localized;
  faqTitle: Localized;
  faqIntro: Localized;
  legalLinks: {
    imprint: Localized;
    privacy: Localized;
    terms: Localized;
  };
};

export type FAQEntry = {
  id: string;
  order: number;
  question: Localized;
  answer: Localized;
};

export type LegalPageRecord = {
  slug: 'imprint' | 'privacy' | 'terms';
  title: Localized;
  body: Localized;
};

export type SearchQuery = {
  checkIn: string;
  checkOut: string;
  guests: number;
  locale: Locale;
};

export type PriceBreakdown = {
  currency: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  taxes: number;
  totalPrice: number;
  depositAmount: number;
};

export type PropertySummary = {
  propertyId: string;
  slug: string;
  title: string;
  summary: string;
  locationLabel: string;
  distanceLabel: string;
  heroImage: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  available: boolean;
  quote: PriceBreakdown;
};

export type AlternativeWindow = {
  label: string;
  checkIn: string;
  checkOut: string;
  availableCount: number;
};

export type SearchResponse = {
  query: SearchQuery;
  results: PropertySummary[];
  alternatives: AlternativeWindow[];
  generatedAt: string;
  source: 'beds24' | 'fallback';
};

export type PropertyQuote = {
  propertyId: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  locationLabel: string;
  distanceLabel: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  highlights: string[];
  amenities: string[];
  houseRules: string[];
  cancellationSummary: string;
  quote: PriceBreakdown;
  available: boolean;
  locale: Locale;
};

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
};

export type BookingSessionStatus =
  | 'awaiting_payment'
  | 'payment_received'
  | 'booking_confirmed'
  | 'conflict_after_payment'
  | 'external_booking_failed'
  | 'cancelled'
  | 'expired';

export type BookingSessionRecord = {
  id: string;
  locale: Locale;
  propertyId: string;
  propertySlug: string;
  beds24PropertyId: number;
  beds24RoomId: number;
  query: SearchQuery;
  guest: GuestDetails;
  quote: PropertyQuote;
  status: BookingSessionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  beds24BookingId?: string;
  lastError?: string;
};

export type CalendarDay = {
  available: boolean;
  numAvail: number;
  minStay: number;
  price?: number;
  closedArrival: boolean;
  closedDeparture: boolean;
};

export type CalendarSnapshot = {
  roomId: number;
  propertyId?: number;
  generatedAt: string;
  lastSyncedAt?: string;
  from?: string;
  to?: string;
  source: 'beds24' | 'fallback' | 'database';
  days: Record<string, CalendarDay>;
  raw?: Record<string, unknown>;
};

export type Beds24Offer = {
  roomId: number;
  available: boolean;
  pricePerNight: number;
  cleaningFee: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  minimumStay: number;
};

export type PropertyImageImportItem = {
  beds24PropertyId?: number;
  beds24RoomId?: number;
  propertySlug?: string;
  internalName?: string;
  imageUrls: string[];
  heroIndex?: number;
};

export type PropertyImageImportResult = {
  propertyKey: string;
  imported: number;
  failedUrls: string[];
  heroImageUrl: string;
  galleryUrls: string[];
  target: {
    beds24PropertyId: number;
    beds24RoomId: number;
    internalName: string;
  };
};

export type PropertyTextImportItem = {
  beds24PropertyId?: number;
  beds24RoomId?: number;
  propertySlug?: string;
  internalName?: string;
  summary: Localized;
  description: Localized;
  locationLabel?: Localized;
};

export type PropertyTextImportResult = {
  propertyKey: string;
  target: {
    beds24PropertyId: number;
    beds24RoomId: number;
    internalName: string;
  };
  summary: Localized;
  locationLabel: Localized;
};
