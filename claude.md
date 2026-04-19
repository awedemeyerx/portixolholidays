# Portixol Holidays – Entwicklungsrichtlinien

## Vision & Positionierung

**Portixol Holidays** ist eine moderne, mehrsprachige Buchungsplattform für Ferienvermietungen (Vacation Rental Marketplace). Die Website verbindet LIVE-Verfügbarkeit und Preise von der **Beds24-API** mit einer eleganten, benutzerfreundlichen Buchungserfahrung.

- **Multi-Locale:** Deutsch, Englisch, Spanisch
- **Real-Time Integration:** Beds24 API für Verfügbarkeit, Preisgestaltung, Buchungsverwaltung
- **Stripe Payment Integration:** 30% Kaution-System
- **Payload CMS:** Content-Management für Properties, Locations, FAQs, Legal Pages
- **SEO & Conversion Optimized:** Suchmaschinenfreundlich, Funneltracking via Vercel Analytics

Die Plattform ist **vollständig produktiv** und funktioniert auch offline mit Fallback-Daten, wenn externe APIs nicht erreichbar sind.

---

## i18n & URL-Architektur

- **Subdirectories** (`/de/`, `/en/`, `/es/`) — keine Subdomains, nie
- **next-intl Library** für i18n-Management (v4.8.1)
- **Automatische Spracherkennung** via Middleware (`src/middleware.ts`) basierend auf `Accept-Language`-Header
- **Lokalisierte Routes:** Jede Seite existiert unter `/:locale/[path]`
  - Homepage: `/:locale/` (z.B. `/de/`, `/en/`, `/es/`)
  - Properties: `/:locale/properties/:slug`
  - Locations: `/:locale/locations/` und `/:locale/locations/:slug`
  - Legal Pages: `/:locale/legal/:slug` (imprint, privacy, terms)
  - FAQ ist inline auf der Homepage
- **Sprachwechsel:** Client-seitig ohne Neuladen (Locale Switcher Komponente)
- **Message Loading:** Über `src/lib/messages.ts` – JSON-Dateien pro Locale in `src/messages/{locale}.json`
- **Hreflang-Tags:** (optional bei SEO-Anforderungen) müssen auf jeder lokalisierten Seite implementiert werden

### Lokalisierungsmuster

```typescript
// Typen
import type { Localized } from '@/lib/holidays/types';
type LocalizedProperty = Localized<string>; // { de: "...", en: "...", es: "..." }

// Werte extrahieren
import { pickLocalized, localizeProperty } from '@/lib/holidays/localize';
const germanTitle = pickLocalized(property.title, 'de');

// In Komponenten (Server Side)
const { locale } = await getLocaleFromRequest();
const properties = await getProperties();
const localizedProps = properties.map(p => localizeProperty(p, locale));
```

---

## Design-Philosophie

**Leitprinzip: Funktionalität trifft Eleganz. Die Daten stehen im Mittelpunkt.**

### Farbpalette (Tailwind + Custom CSS Variables)

Alle Farben sind in `src/app/globals.css` als CSS-Variablen definiert und in `tailwind.config.ts` erweitert:

```css
--sand: #f3e6d4      /* Warmes, helles Beige */
--ink: #15354a       /* Tiefes Navy-Blau */
--sea: #3e92a8       /* Mittleres Türkis */
--terracotta: #c77c5b /* Warm-Orange */
--foam: #fbf6ee      /* Ultra-helles Cream */
--mist: #718089      /* Kühles Grau */
--sky: #dbeff4       /* Helles Blau */
```

**Verwendung:**
- **Hintergrund:** `bg-ink` (dunkel) oder `bg-foam` (hell, selten)
- **Text:** `text-ink` primär, `text-mist` sekundär
- **Akzente:** `text-sea`, `border-sea`, `bg-sky/10` für subtile Highlights
- **Links/CTAs:** `text-sea hover:text-terracotta`

### Typographie

**Fonts via `next/font`:**
- **Playfair Display** (`--font-playfair`, `font-playfair`): Überschriften, Property-Namen
  - Styling: `text-2xl md:text-4xl font-playfair font-bold text-ink`
- **Inter** (`--font-inter`, `font-sans`): UI, Fließtext, Forms
  - Styling: `text-base font-inter text-ink/70`

### Button-Stil

```jsx
// ✅ Primär: Solid Sea Button
className="inline-flex items-center justify-center px-6 py-3 bg-sea hover:bg-sea/90 text-white rounded-lg font-medium transition-colors"

// ✅ Sekundär: Ghost/Outline Button
className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-sea text-sea hover:bg-sea/5 rounded-lg font-medium transition-colors"

// ✅ Tertiary: Minimal Link
className="text-sea hover:text-terracotta underline font-medium transition-colors"
```

### Spacing & Layout

- **Container:** `max-w-6xl mx-auto px-4 md:px-8`
- **Sections:** `py-12 md:py-20` (großzügige Abstände)
- **Gaps:** `gap-6 md:gap-8` in Grids
- **Cards:** `rounded-lg border border-sand bg-white shadow-sm`

### Komponenten-Patterns

**Glass Card (Suche/Filter):**
```jsx
className="bg-white/95 backdrop-blur-sm border border-sand rounded-lg p-6 shadow-sm"
```

**Section Title:**
```jsx
className="text-3xl font-playfair font-bold text-ink mb-12"
```

**Label/Badge:**
```jsx
className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-sky text-ink rounded-full"
```

---

## Content-Regeln

### Produktdaten: Beds24 + CMS ist Single Source of Truth

**Alle dynamischen Daten kommen NICHT aus Hardcoding, sondern aus:**

1. **Payload CMS** (wenn konfiguriert):
   - Properties-Collection (mit Beds24 Property-ID & Room-ID)
   - Locations-Collection
   - Site Settings (global: supportEmail, whatsapp, etc.)
   - FAQs, Legal Pages

2. **Beds24 API** (LIVE):
   - Verfügbarkeit (Calendar, 365 Tage)
   - Preise & Offers (nightly, cleaning fee, taxes)
   - Booking-Management

3. **Database (Supabase PostgreSQL)**:
   - Inventory Snapshots (gecachte 365-Tage-Kalender)
   - Offer Cache (gecachte Preise)
   - Booking Sessions
   - Beds24 Content (gecachte Property-Metadaten)

**Zugriff auf Daten:**

```typescript
// Server Components
import { getProperties, getPropertyBySlug, getSiteSettings } from '@/lib/holidays/services/cms';
const properties = await getProperties();
const settings = await getSiteSettings();

// API Routes
import { searchProperties } from '@/lib/holidays/services/search';
const results = await searchProperties({ checkIn, checkOut, guests, locale, location });

// Beds24 Client (direkt)
import { getBeds24Token, fetchBeds24Offers } from '@/lib/holidays/beds24/client';
const token = await getBeds24Token();
const offers = await fetchBeds24Offers(propertyIds, roomIds, checkIn, checkOut);
```

### Texte in Config & Messages

**Layout- und Marketing-Texte in `src/lib/messages/{locale}.json`:**
- Hero-Texte
- Search Placeholder
- Button Labels
- Error Messages
- Footer Links
- Locale Switcher Labels

**Keine hardcodierten Strings in Komponenten.** Import von `useTranslations`:

```typescript
const t = useTranslations();
<h1>{t('Header.title')}</h1>
<button>{t('Search.submitButton')}</button>
```

### Tonalität

- Sachlich, aber einladend
- Kurze Sätze bevorzugen
- Das Property und die Verfügbarkeit stehen im Mittelpunkt, nicht die Technik
- Preise immer inkl. Mehrwertsteuer

---

## Buchungssystem

**3-Schritt-Buchungsflow mit minimaler Reibung:**

1. **Verfügbarkeit & Preis** (Search)
   - Datumswahl (Check-In/Check-Out)
   - Anzahl Gäste
   - Automatische Quote-Berechnung
   - Live-Preise aus Beds24

2. **Gastdaten** (Booking Form)
   - Vorname, Nachname (min. 2 Zeichen)
   - E-Mail
   - Telefon (min. 5 Zeichen)
   - Optional: NIE/DNI/CIF (Spanien)
   - Sonderwünsche (Textarea)
   - Rechtliche Zustimmungen (Checkboxen)

3. **Zahlung & Bestätigung**
   - Stripe Payment (30% Kaution)
   - ODER: Direct Booking (ohne Stripe, Zahlung vor Ort)
   - Booking Creation in Beds24
   - Confirmation Email (dreisprachig)

**Konfiguration in `src/lib/booking.config.ts`:**
- Verfügbare Zeitslots (z.B. 16:00–18:00)
- Sperrdaten (z.B. Umzugs-Tage)
- Min./Max. Übernachtungen
- Kaution (default 30%)

**Validierung via Zod (`src/lib/holidays/validation.ts`):**
```typescript
searchQuerySchema // Validates check-in/out dates, guest count, locale
checkoutPayloadSchema // Validates booking form
```

---

## Tech-Stack

### Core Framework
- **Next.js 15.4** (App Router, Server Components)
- **TypeScript** (strict mode)
- **React 19**

### Styling & UI
- **Tailwind CSS 4**
- **CSS Variables** (custom colors in `globals.css`)
- **next/font** (Playfair Display, Inter)

### i18n & Content
- **next-intl 4.8** (Routing, Message Loading)
- **Payload CMS 3.79** (Content Management)
- **Payload Integrations:**
  - `@payloadcms/db-postgres` (Database)
  - `@payloadcms/next` (Next.js Integration)
  - `@payloadcms/richtext-lexical` (Rich Text Editor)
  - `@payloadcms/storage-vercel-blob` (File Storage)

### Database & Backend
- **Supabase** (PostgreSQL)
  - Payload CMS Data
  - Inventory Snapshots
  - Offer Cache
  - Booking Sessions
  - Beds24 Content Cache
- **Stripe SDK** (`stripe@latest`)
  - Deposit Payments (30%)
  - Webhook Handling

### External APIs
- **Beds24 API v2**
  - Availability (Calendar)
  - Pricing (Offers)
  - Booking Management
  - Token Refresh Flow (OAuth-ähnlich)
- **Vercel Analytics**
  - Funnel Tracking (search submitted, booking initiated, etc.)

### Data Validation & Type Safety
- **Zod** (Runtime Schema Validation)
- **TypeScript Strict Mode**

### Performance & Caching
- **Vercel Blob Storage** (Images/Videos)
- **In-Memory Cache** (60s TTL for CMS queries)
- **JSON Store Cache** (Fallback offline data)
- **Database Query Caching** (via API Response Headers: `s-maxage=120`)

### Environment
- **Vercel** (Hosting, Analytics, Blob Storage)
- **Vercel Cron Jobs** (via `vercel.json`):
  - `*/30 * * * *` → `/api/internal/beds24/sync-inventory`
  - `17 3 * * *` → `/api/internal/beds24/sync-content`

---

## Projektstruktur

```
src/
├── app/
│   ├── [locale]/                     # Sprachrouten (de/en/es)
│   │   ├── layout.tsx                # Locale-spezifisches Layout
│   │   ├── page.tsx                  # Homepage mit Search
│   │   ├── properties/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Property Detail Page
│   │   ├── locations/
│   │   │   ├── page.tsx              # Locations Listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Location Detail Page
│   │   └── legal/
│   │       └── [slug]/
│   │           └── page.tsx          # Legal Pages (imprint, privacy, terms)
│   ├── api/
│   │   ├── search/
│   │   │   └── route.ts              # GET: Property Search (with quote)
│   │   ├── properties/
│   │   │   └── [slug]/
│   │   │       └── quote/
│   │   │           └── route.ts      # GET: Price Quote for Property+Dates
│   │   ├── checkout/
│   │   │   └── session/
│   │   │       └── route.ts          # POST: Create Stripe Session or Direct Booking
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts          # POST: Stripe Payment Confirmation
│   │   │   └── beds24/
│   │   │       ├── bookings/
│   │   │       │   └── route.ts      # POST: Beds24 Booking Webhook
│   │   │       └── inventory/
│   │   │           └── route.ts      # POST: Beds24 Inventory Change Webhook
│   │   └── internal/
│   │       └── beds24/
│   │           ├── sync-inventory/
│   │           │   └── route.ts      # POST: Trigger Inventory Snapshot Sync (Cron)
│   │           └── sync-content/
│   │               └── route.ts      # POST: Trigger Content Sync from Beds24 (Cron)
│   ├── globals.css                   # Root Styles (CSS Variables, Animations)
│   ├── layout.tsx                    # Root Layout (Fonts, Analytics, Metadata)
│   ├── page.tsx                      # Root Redirect (to :locale)
│   └── middleware.ts                 # Locale Detection & Redirect (if needed)
│
├── collections/                      # Payload CMS Collections
│   ├── Properties.ts                 # Property Listings (with Beds24 IDs)
│   ├── Locations.ts                  # Locations/Destinations
│   ├── Users.ts                      # Admin Users
│   ├── Media.ts                      # Image/File Storage
│   ├── Beds24PropertyContent.ts       # Cached Property Data from Beds24
│   ├── Beds24OfferCache.ts            # Cached Pricing Offers
│   ├── Beds24InventorySnapshots.ts    # 365-Day Calendar Snapshots per Room
│   ├── FAQEntries.ts                 # FAQ Questions/Answers
│   ├── LegalPages.ts                 # Legal Content (Imprint, Privacy, Terms)
│   ├── BookingSessions.ts            # (referenced) Booking Session Storage
│   └── Pages.ts                      # (referenced) CMS-Managed Static Pages
│
├── globals/
│   └── SiteSettings.ts               # Global Settings (Email, Phone, Rates, etc.)
│
├── components/
│   ├── site-header.tsx               # Global Header (Logo, Nav, Locale Switcher)
│   ├── site-footer.tsx               # Global Footer (Links, Contact, Copyright)
│   ├── brand-logo.tsx                # Brand Logo Component
│   ├── locale-switcher.tsx           # Language Switcher (de/en/es)
│   ├── search/
│   │   ├── stay-search-form.tsx      # Check-In/Out + Guest Count Form
│   │   ├── date-range-picker.tsx     # Visual Date Picker Component
│   │   ├── property-card.tsx         # Property Grid Card
│   │   └── search-results.tsx        # Search Results List (with Pagination)
│   ├── property/
│   │   ├── booking-panel.tsx         # Quote + Booking Form (on Detail Page)
│   │   ├── property-gallery.tsx      # Photo Gallery Component
│   │   └── property-hero.tsx         # Hero Image + Title Section
│   ├── location/
│   │   ├── location-card.tsx         # Location Overview Card
│   │   └── location-property-card.tsx # Property Card within Location
│   └── shared/
│       ├── Button.tsx                # Reusable Button Variants
│       ├── Badge.tsx                 # Label/Badge Component
│       └── FormField.tsx             # Form Input Wrapper with Label/Error
│
├── lib/
│   ├── holidays/
│   │   ├── types.ts                  # Core Types (Property, Location, Booking, etc.)
│   │   ├── locale.ts                 # Locale Helpers (detectLocale, isLocale, etc.)
│   │   ├── localize.ts               # Localization Utilities (pickLocalized, etc.)
│   │   ├── dates.ts                  # Date Manipulation (formatDate, diffNights, etc.)
│   │   ├── seo.ts                    # SEO Metadata Generation
│   │   ├── validation.ts             # Zod Schemas (searchQuerySchema, etc.)
│   │   ├── payload-fields.ts         # Helper Functions for Payload Field Definitions
│   │   │
│   │   ├── services/
│   │   │   ├── cms.ts                # Payload CMS Integration (getProperties, etc.)
│   │   │   ├── search.ts             # Property Search & Filtering
│   │   │   ├── booking.ts            # Booking Creation & Checkout Logic
│   │   │   ├── locations.ts          # Location Data Management
│   │   │   ├── inventory-snapshots.ts # Calendar Snapshot Storage/Retrieval
│   │   │   ├── offers.ts             # Pricing Offer Management
│   │   │   ├── quote.ts              # Quote Generation
│   │   │   └── beds24-content.ts     # Content Sync from Beds24
│   │   │
│   │   ├── beds24/
│   │   │   └── client.ts             # Beds24 API Client (Token, Offers, Bookings, etc.)
│   │   │
│   │   ├── cache/
│   │   │   ├── memory.ts             # In-Memory Cache (with TTL)
│   │   │   ├── json-store.ts         # JSON File Cache
│   │   │   └── booking-sessions.ts   # Booking Session Cache
│   │   │
│   │   └── data/
│   │       └── fallback.ts           # Hardcoded Fallback Data (when CMS/Beds24 down)
│   │
│   ├── supabase.ts                   # Supabase Client Initialization
│   ├── payload.ts                    # Payload CMS Client + isCmsConfigured()
│   ├── messages.ts                   # Message Loading (per Locale)
│   └── booking.config.ts             # Booking Slots, Blocked Dates, Settings
│
├── i18n/
│   └── request.ts                    # next-intl getRequestConfig
│
├── messages/
│   ├── de.json                       # German Messages
│   ├── en.json                       # English Messages
│   └── es.json                       # Spanish Messages
│
└── actions/
    └── (referenced) Server Actions (forms, etc.)

public/
├── images/                           # Static Images (Brand Assets)
├── robots.txt                        # SEO
└── sitemap.xml                       # (generated) Sitemap

config/
├── next.config.mjs                   # Next.js Config (i18n, Image Patterns)
├── tailwind.config.ts                # Tailwind Config (Colors, Fonts)
├── tsconfig.json                     # TypeScript Config
├── vercel.json                       # Vercel Cron Jobs
└── payload.config.ts                 # Payload CMS Config
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=<random-secret>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Beds24 (REST API)
BEDS24_API_BASE_URL=https://beds24.com/api/v2
BEDS24_TOKEN=<initial-token>                  # (or use refresh token)
BEDS24_REFRESH_TOKEN=<refresh-token>
BEDS24_SYNC_SECRET=<secret-for-cron-auth>
BEDS24_WEBHOOK_SECRET=<secret-for-webhook>

# Blob Storage (Vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Cache
PORTIXOL_CACHE_DIR=/tmp/portixol-cache

# App
NEXT_PUBLIC_BASE_URL=https://portixolholidays.com
CRON_SECRET=<secret-for-cron-auth>
```

---

## Datenmodelle

### Property (Payload Collection)

```typescript
{
  id: string;
  internalName: string;           // Admin Label
  priority: number;               // Sorting (lower first)
  beds24PropertyId: number;        // Beds24 External ID
  beds24RoomId: number;            // Beds24 Room ID
  location?: LocationRecord;       // Relationship to Location
  
  // Localized Fields
  slugs: Localized<string>;        // URL Slug
  title: Localized<string>;        // Property Name
  summary: Localized<string>;      // Short Description
  description: Localized<string>;  // Full Description
  locationLabel: Localized<string>;// "Near Beach" etc.
  distanceLabel: Localized<string>;// "5 km from Center"
  
  // Structure
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  
  // Media
  heroImage: { url: string };
  gallery: { image: { url: string } }[];
  highlights: { label: Localized<string> }[];
  amenities: { label: Localized<string> }[];
  houseRules: { label: Localized<string> }[];
  
  // Pricing
  pricing: {
    nightly: number;              // EUR
    cleaningFee: number;           // EUR
    taxes: number;                 // EUR
    minStay: number;               // Nights
    depositRate: number;           // 0.3 = 30%
  };
  
  // Content
  cancellationSummary: Localized<string>;
  seoTitle: Localized<string>;
  seoDescription: Localized<string>;
  
  // Availability
  blockedRanges: { from: string; to: string }[]; // ISO dates
}
```

### Location (Payload Collection)

```typescript
{
  id: string;
  internalName: string;
  priority: number;
  
  // Localized Fields
  slugs: Localized<string>;
  title: Localized<string>;
  summary: Localized<string>;
  description: Localized<string>;
  directions: Localized<string>;  // How to find
  
  // Media
  heroImageUrl: string;           // CDN URL
  
  // Relationships
  beds24PropertyIds: number[];    // Which properties in this location
}
```

### SiteSettings (Payload Global)

```typescript
{
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp: string;               // WhatsApp Number (for CTA)
  depositRate: number;            // Default: 0.3
  
  // Localized Hero Copy
  hero: Localized<{
    headline: string;
    subheadline: string;
    cta: string;
  }>;
  
  // Search Messages
  search: Localized<{
    placeholder: string;
    emptyState: string;
    noResults: string;
  }>;
  
  // FAQ Title/Intro
  faqTitle: Localized<string>;
  faqIntro: Localized<string>;
  
  // Legal Links (localized slugs)
  legalLinks: Localized<{ imprint: string; privacy: string; terms: string }>;
}
```

### Inventory Snapshot (Database)

```typescript
{
  id: string;
  beds24PropertyId: number;
  beds24RoomId: number;
  
  // 365 days starting from today
  calendar: {
    [YYYY-MM-DD]: {
      available: boolean;
      minStay: number;
      pricePerNight: number;        // EUR
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;                 // TTL for cache
}
```

---

## API Endpoints

### GET `/api/search`

**Query Params:**
- `checkIn` (ISO date: YYYY-MM-DD)
- `checkOut` (ISO date)
- `guests` (1-12)
- `locale` (de|en|es, optional, defaults to request locale)
- `location` (slug, optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop-1",
      "title": "Cozy Apartment",
      "location": "Barcelona",
      "nights": 3,
      "pricePerNight": 120,
      "cleaningFee": 40,
      "taxes": 50,
      "deposit": 51,     // 30% of (price + cleaning + taxes)
      "total": 170,
      "available": true,
      "image": "..."
    }
  ],
  "timestamp": "2024-03-24T10:00:00Z"
}
```

**Caching:** `s-maxage=120, stale-while-revalidate=600`

### GET `/api/properties/[slug]/quote`

**Query Params:**
- `checkIn` (ISO date)
- `checkOut` (ISO date)
- `guests` (number)

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop-1",
    "pricePerNight": 120,
    "cleaningFee": 40,
    "taxes": 50,
    "subtotal": 410,
    "deposit": 123,
    "total": 410,
    "breakdown": [
      { "label": "3 nights @ €120", "amount": 360 },
      { "label": "Cleaning Fee", "amount": 40 },
      { "label": "Taxes", "amount": 50 }
    ]
  }
}
```

### POST `/api/checkout/session`

**Body:**
```json
{
  "propertySlug": "cozy-apartment",
  "checkIn": "2024-04-01",
  "checkOut": "2024-04-04",
  "guests": 2,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+34912345678",
  "locale": "en",
  "paymentMode": "stripe" // or "direct"
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/pay/...",
  "sessionId": "cs_test_..."
}
```

**Response (Direct):**
```json
{
  "success": true,
  "bookingId": "booking-123",
  "message": "Booking confirmed. Payment will be collected on-site."
}
```

### POST `/api/webhooks/stripe`

Handles Stripe `checkout.session.completed` events. Creates booking in Beds24 upon successful payment.

### POST `/api/webhooks/beds24/bookings`

Receives booking updates from Beds24 (new bookings, cancellations, modifications).

### POST `/api/webhooks/beds24/inventory`

Receives inventory change notifications from Beds24 (availability, price updates).

### POST `/api/internal/beds24/sync-inventory`

**Trigger:** Vercel Cron Job (`*/30 * * * *`)
**Auth:** `CRON_SECRET` in header
**Action:** Fetches 365-day calendar snapshot from Beds24 for all rooms, stores in DB.

### POST `/api/internal/beds24/sync-content`

**Trigger:** Vercel Cron Job (`17 3 * * *`)
**Auth:** `CRON_SECRET` in header
**Action:** Syncs property metadata from Beds24 to database, updates cached property content.

---

## Beds24 Integration

### Token Management

**Authentication Flow:**
1. Store `BEDS24_TOKEN` (access token) + `BEDS24_REFRESH_TOKEN` (refresh token)
2. Before API calls, check token expiration (tracked internally)
3. If expired, use refresh token to get new access token
4. Auto-refresh is transparent to consumers

```typescript
import { getBeds24Token } from '@/lib/holidays/beds24/client';
const token = await getBeds24Token(); // Returns valid token (auto-refreshes if needed)
```

### API Methods

**Availability & Pricing:**
```typescript
const offers = await fetchBeds24Offers(
  propertyIds: [123],
  roomIds: [456],
  checkIn: '2024-04-01',
  checkOut: '2024-04-04'
);
// Returns: [{ minStay, pricePerNight, currency, ... }]
```

**365-Day Calendar:**
```typescript
const calendar = await fetchBeds24Calendar(
  propertyId: 123,
  roomId: 456,
  fromDate: '2024-03-24' // (defaults to today)
);
// Returns: Paginated calendar with availability & pricing per day
```

**Create Booking:**
```typescript
const booking = await createBeds24Booking({
  propertyId: 123,
  roomId: 456,
  checkIn: '2024-04-01',
  checkOut: '2024-04-04',
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  locale: 'en'
});
// Returns: Booking confirmation with ID
```

### Fallback Behavior

If Beds24 is unavailable (network error, API down, misconfigured):

1. **Search:** Returns fallback properties with estimated pricing
2. **Booking:** Shows message "We'll confirm availability manually" + booking created locally
3. **No broken experience:** Fallback data in `src/lib/holidays/data/fallback.ts`

---

## Search & Booking Flow

### 1. User Enters Search
- Selects Check-In Date, Check-Out Date, Guest Count
- Frontend calls `GET /api/search?checkIn=...&checkOut=...&guests=...&locale=en`

### 2. Backend Search Logic
```
1. Validate query with Zod
2. Fetch all Properties from CMS
3. Filter by guest count (maxGuests >= guests)
4. For each property, fetch live Beds24 offer OR use DB snapshot
5. Calculate total price (nightly + cleaning + taxes)
6. Calculate 30% deposit
7. Sort by priority (CMS) + price (ascending)
8. Return top 20 results
```

### 3. User Clicks Property
- Route to `/:locale/properties/:slug`
- Shows property details, hero image, gallery, amenities, reviews (if available)
- **Right Side:** Booking Panel

### 4. Booking Panel (Client Component)
- Show calendar with available dates
- Re-fetch quote on date change via `GET /api/properties/[slug]/quote`
- Show price breakdown (nightly, cleaning, taxes, deposit, total)
- Guest enters: First Name, Last Name, Email, Phone, (optional: NIE/DNI/CIF)
- Checkboxes: Cancellation Policy, Privacy Policy, Legal Terms
- CTA: "Book Now" → POST `/api/checkout/session`

### 5. Checkout Flow (Server)
- Validate guest data
- Re-validate quote freshness (max 30 min old)
- **If Stripe Mode:**
  - Create Stripe Session with 30% deposit amount
  - Redirect to Stripe Checkout
  - Stripe webhook on success → Create Beds24 booking
- **If Direct Mode:**
  - Create Beds24 booking immediately
  - Show confirmation
  - Send email to guest

### 6. Confirmation Email
- Sent by Brevo (SMTP)
- Template in HTML (dark background, minimalist design)
- Includes: Property details, check-in/out dates, price breakdown, booking reference
- Threesprachig: DE, EN, ES with flag emojis
- No images (just text + structured data)

---

## Caching Strategy

### In-Memory Cache (60s TTL)
**Purpose:** Fast repeated access to CMS data (Properties, Locations, Settings)

```typescript
// src/lib/holidays/cache/memory.ts
const cache = new MemoryCache({ defaultTTL: 60000 }); // 60 seconds
const properties = await cache.getOrSet('properties', () => fetchFromPayload());
```

### Database Cache (Beds24 Snapshots)
**Purpose:** Store 365-day calendar snapshots to avoid Beds24 API rate limits

```typescript
// Query Beds24 every 30 min (cron job)
// Store in: Beds24InventorySnapshots collection
// Search uses snapshots + live API (if < 30 min old)
```

### JSON Store Cache
**Purpose:** Fallback when database/CMS down

```typescript
// src/lib/holidays/cache/json-store.ts
// Stores: Properties, Locations, Settings, Fallback Data
// Used when isCmsConfigured() = false
```

---

## Error Handling & Resilience

### Graceful Degradation

1. **CMS Unavailable?** → Use in-memory cache, then JSON store fallback
2. **Beds24 API Down?** → Use DB snapshots (up to 30 min old), then fallback pricing
3. **Database Down?** → Use JSON store fallback data
4. **No Fallback?** → Show message: "We're experiencing technical difficulties. Please try again later or contact us."

### Validation Everywhere

- **API Query Params:** Zod schema validation
- **Booking Form:** Zod schema validation
- **Beds24 Response:** Normalized/validated with schema guards
- **Database Queries:** TypeScript types + Zod validation

---

## Vercel Analytics & Conversion Tracking

### Funnel Events (Client-Side)

```typescript
import { track } from '@vercel/analytics';

// User opens search modal
track('funnel_search_opened');

// User submits search
track('funnel_search_submitted', { guests: 2, nights: 3 });

// User clicks property
track('funnel_property_viewed', { propertyId: 'prop-1', price: 350 });

// User opens booking form
track('funnel_booking_opened', { propertyId: 'prop-1' });

// User initiates checkout
track('funnel_checkout_initiated', { total: 170 });

// User closes modal
track('funnel_modal_closed');
```

### Conversion Tracking (Server-Side)

Only fire **after successful booking confirmation:**
- Meta CAPI (via Edge Function or server action)
- Google Ads API conversion event
- Custom CRM webhook

---

## Development Workflow

### Before Starting Work

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in values from Vercel dashboard / team password manager

# Start dev server
npm run dev
```

### Making Changes

1. **Create feature branch** from `main`
2. **Make commits** with clear prefix (`feat:`, `fix:`, `docs:`)
3. **Test locally** (`npm run dev`, test search, booking, etc.)
4. **Push branch** and open PR
5. **Code review** with another team member
6. **Merge to main** → Auto-deploy to production (Vercel)

### Git Workflow (Critical!)

> ⚠️ **Multiple AI Agents may work on this project simultaneously!**

1. **Before every session:** `git pull origin main`
2. **Before pushing:** `git pull --rebase origin main` (prevent merge conflicts)
3. **Small, focused commits** (easier to resolve conflicts)
4. **Clear commit messages:** Describe WHAT and WHY

---

## SEO & Performance

### SEO Basics

- **Meta Titles & Descriptions:** Generated per locale in routes
- **Hreflang Tags:** (optional, add if multi-regional) Link alternate versions
- **Structured Data (JSON-LD):** LocalBusiness + Product schema
- **Sitemap:** `app/sitemap.ts` (auto-generated)
- **Robots.txt:** `public/robots.txt` (disallow admin routes)

### Performance

- **Images:** Vercel Blob + next/image (with sizes + quality optimization)
- **Code Splitting:** Server Components by default, Client Components where needed
- **API Caching:** See Caching Strategy section
- **Lazy Loading:** Date picker, property gallery (IntersectionObserver)

---

## Troubleshooting

### Search Returns No Results

1. Check Beds24 configuration (token, refresh token, property IDs)
2. Verify property `beds24PropertyId` and `beds24RoomId` in CMS
3. Check inventory snapshot cron job (last run time in Vercel dashboard)
4. Fall back to hardcoded data in `fallback.ts` for testing

### Booking Fails

1. Verify Stripe keys (webhook secret especially)
2. Check Beds24 booking creation (test manually via API)
3. Verify guest email/phone validation (Zod schemas)
4. Check Brevo email configuration (API key, sender address)

### Translation Missing

1. Add key to `src/messages/{locale}.json`
2. Restart dev server (hot reload may not catch JSON changes)
3. Use `useTranslations()` in components

### Cron Job Not Running

1. Verify `CRON_SECRET` in environment + `vercel.json`
2. Check Vercel dashboard → Crons tab for last execution
3. Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://domain.com/api/internal/beds24/sync-inventory`

---

## Kontakt & Support

- **Email:** support@portixolholidays.com (from CMS settings)
- **WhatsApp:** +34... (from CMS settings)
- **Admin Panel:** `/admin` (Payload CMS)

---

## Roadmap & Offene Aufgaben

→ Siehe [`tasks.md`](./tasks.md)
