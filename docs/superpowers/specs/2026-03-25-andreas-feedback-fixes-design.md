# Andreas Feedback Fixes — Design Spec

**Date:** 2026-03-25
**Source:** Email from Andreas v. Lochow (Head of Family Office)
**Scope:** 8 work packages addressing UI bugs, data corrections, missing properties, FAQ content, and review feature scoping

---

## Work Packages Overview

| # | Issue | Type | Effort |
|---|-------|------|--------|
| 1 | Calendar navigation overlaps day numbers | CSS bug | small |
| 2 | Minimum-stay hint instead of generic error | Logic + i18n | medium |
| 3 | Property cards: show guest capacity, move room counts to description text | UI simplification + i18n | small |
| 4 | Footer phone number → +34 871 180 796 | Data fix | trivial |
| 5 | Import missing properties from Beds24 (Casa Faro, Villa Molinar) | API import + fallback data | medium-large |
| 6 | Correct room counts (Casa Luz: 3 bed / 2 bath) | Data fix | trivial |
| 7 | FAQ content creation | Content + i18n | medium |
| 8 | Guest reviews (Airbnb/Booking.com) | New feature (scoping only) | deferred |

---

## WP1: Calendar Navigation Overlap

**Problem:** The `<` / `>` month-navigation buttons in `date-range-picker.tsx:318-334` overlap day numbers on smaller viewports. Both buttons and the status text ("3 nights" / "Select departure") share a single `flex justify-between` row above the calendar grid.

**Root cause:** Insufficient spacing between the header bar and the calendar grid, combined with the nav buttons competing for horizontal space with the status text.

**Solution:** Move the prev/next navigation buttons into the month-title row (one per month panel, flanking the month label). This follows the standard datepicker UX pattern and permanently resolves the overlap.

**Files to change:**
- `src/components/search/date-range-picker.tsx` — restructure the header: remove `<` / `>` from the top bar, place them as left/right controls in the month-title `<h3>` row (lines 340-343)
- `src/app/globals.css` — no changes expected, but verify `.stay-day` cells have no overflow issues after restructure

**Implementation detail:**
- Left month panel gets `<` button (prev) on the left of its month label
- Right month panel gets `>` button (next) on the right of its month label
- The top bar retains only the status text (nights count / selection prompt) and the "Clear dates" action
- On mobile (single-column), both nav buttons appear flanking the single visible month label

---

## WP2: Minimum-Stay Hint

**Problem:** When a booking fails due to minimum-stay requirements, the system shows only a generic message: "We could not find a bookable offer for this selection right now. Please try different dates." (`Property.quoteUnavailable`). The minStay data exists in `CalendarSnapshot.days[date].minStay` and `pricing.minStay` but is not surfaced to the user.

**Solution:** Return structured error information from the quote API and display a specific minimum-stay message.

**Service layer change** (`src/lib/holidays/services/quote.ts`):
- Currently `getPropertyQuoteBySlug()` returns `null` for multiple distinct failure conditions (property not found, guest count exceeded, zero nights, minStay violation). The caller cannot distinguish the reason.
- Refactor to return a discriminated result type:
  ```typescript
  type QuoteResult =
    | { ok: true; quote: PropertyQuote }
    | { ok: false; reason: 'not_found' | 'min_stay' | 'unavailable'; minStay?: number; nights?: number };
  ```
- Add explicit minStay check: compare `diffNights(checkIn, checkOut)` against `property.pricing.minStay` (and calendar-level minStay if available from Beds24). Return `{ ok: false, reason: 'min_stay', minStay, nights }` when violated.

**API change** (`src/app/api/properties/[slug]/quote/route.ts`):
- Use the structured result from the service layer.
- When `reason === 'min_stay'`, return HTTP 400 with:
  ```json
  { "error": "min_stay", "minStay": 4, "nights": 2 }
  ```
- For other failures, return the existing generic error.

**Frontend change** (`src/components/property/booking-panel.tsx`):
- The current `.catch()` handler (around line 117) swallows the response body. Restructure the non-ok branch to preserve the parsed payload:
  1. Parse `response.json()` in the non-ok branch
  2. Check if `payload.error === 'min_stay'`
  3. If yes, set a specific state with `{ minStay, nights }` instead of the generic `quoteError`
  4. Render the `quoteMinStay` message with interpolated values
  5. Otherwise, fall through to the existing `quoteUnavailable` behavior

**New i18n keys** (all 3 locale files — note: variable names match the API response field names):
```json
{
  "Property": {
    "quoteMinStay": "This property requires a minimum stay of {minStay} nights. You selected {nights}."
  }
}
```

| Locale | Key | Value |
|--------|-----|-------|
| en | `Property.quoteMinStay` | "This property requires a minimum stay of {minStay} nights. You selected {nights}." |
| de | `Property.quoteMinStay` | "Dieses Objekt erfordert einen Mindestaufenthalt von {minStay} Nächten. Du hast {nights} gewählt." |
| es | `Property.quoteMinStay` | "Este alojamiento requiere una estancia mínima de {minStay} noches. Has seleccionado {nights}." |

**Files to change:**
- `src/lib/holidays/services/quote.ts` (refactor return type, add minStay check)
- `src/app/api/properties/[slug]/quote/route.ts` (use structured result)
- `src/components/property/booking-panel.tsx` (restructure error handling to preserve payload)
- `src/messages/en.json`, `de.json`, `es.json`

---

## WP3: Property Cards — Guest Capacity Focus

**Problem:** Property cards show "2 Bedrooms · 2 Bathrooms · 4 max guests" with static plural labels. Andreas confirmed: the relevant metric for users (and filtering) is the **number of guests**, not room counts. Room details belong in the description text.

**Solution:**
- Remove `beds` / `baths` display from `property-card.tsx` (the `flex flex-wrap gap-3` stats div)
- Keep only the guest capacity display: `{property.maxGuests} {labels.guestsMax}`
- Move bedroom/bathroom counts into each property's `summary` or `description` text (in all 3 languages) where relevant
- Remove `beds` and `baths` from the `labels` prop type in `property-card.tsx` and all call sites that pass these labels (search results parent component). Keep the i18n keys in message files for potential future use on detail pages.
- **Important:** Keep `bedrooms` and `bathrooms` fields in the `PropertyRecord` and `PropertySummary` types — only remove them from the card UI, not from the data model.

**On property detail page** (`properties/[slug]/page.tsx`):
- Bedroom/bathroom info is already implicitly present in descriptions and highlights. No structural change needed. If specific counts should appear, add them to the highlights array per property in fallback data.

**Files to change:**
- `src/components/search/property-card.tsx` (remove beds/baths display, update `labels` type)
- `src/components/search/search-shell.tsx` or parent component that passes labels (remove `beds`/`baths` label props)
- `src/lib/holidays/data/fallback.ts` (ensure descriptions mention rooms where relevant)

---

## WP4: Footer Phone Number

**Problem:** Fallback phone is `+34 971 000 000`, should be `+34 871 180 796`.

**Solution:** Update `fallbackSiteSettings.supportPhone` in `src/lib/holidays/data/fallback.ts`.

**Changes:**
```typescript
supportPhone: '+34 871 180 796',
```

**Note:** The `whatsapp` field is also a placeholder (`+34 600 000 000`). Confirm with Andreas whether the WhatsApp number should also be updated (same number, or different?). For now, update only the phone number as explicitly requested.

**Files to change:**
- `src/lib/holidays/data/fallback.ts` (supportPhone in fallbackSiteSettings)

---

## WP5: Import Missing Properties from Beds24

**Problem:** 7 properties exist in Beds24, but only 5 are in the system. Missing: Casa Faro (266083, Andratx) and Villa Molinar (190433, Palma).

**Beds24 Property IDs (complete):**

| Name | Property ID | City |
|------|------------|------|
| Casa Faro | 266083 | Andratx |
| Casa Luz | 174132 | Palma |
| Casa Mar | 174133 | Palma |
| Casa Playa | 244684 | Palma |
| Casa Portixol Playa | 244683 | Palma |
| Casa Puerto | 266085 | Andratx |
| Villa Molinar | 190433 | Palma |

**Solution:** Create a one-time import script that:

1. Calls `fetchBeds24PropertyCatalog({ ids: [266083, 190433], includeAllRooms: true, includeLanguages: ['de', 'en', 'es'], includeTexts: ['description', 'summary'], includePictures: true })` to fetch Casa Faro and Villa Molinar data
2. Also fetches the full catalog for all 7 properties to verify/update room IDs and metadata
3. Extracts: room IDs, titles, descriptions (3 languages), bedroom/bathroom counts, max guests, images, amenities, pricing, minStay
4. Generates updated `fallbackProperties` entries for `fallback.ts`

**Script location:** `scripts/import-beds24-properties.ts`

**The script must:**
- Authenticate with Beds24 using the existing token mechanism
- Map Beds24 response fields to our `PropertyRecord` type
- Generate localized content (de/en/es) from Beds24's multilingual fields
- Output the TypeScript code for `fallback.ts` entries
- Handle missing fields gracefully (use sensible defaults)
- **Room ID selection:** The API returns multiple rooms per property when `includeAllRooms: true`. For existing properties, use the known `beds24RoomId` values. For new properties (Casa Faro, Villa Molinar), select the first/primary room — typically the one with `roomId` closest to the property ID, or explicitly pick based on the room name. Log all room IDs found so the operator can verify.

**Rollback strategy:**
- Back up `fallback.ts` before running the import (the script should create `fallback.ts.bak`)
- **Step 1:** Add only Casa Faro + Villa Molinar entries (additive, no existing data touched)
- **Step 2:** In a separate commit, update existing properties with fresh Beds24 data (review diff carefully)

**After import, manually verify:**
- All 7 properties have correct room IDs
- Descriptions read well in all 3 languages
- Image URLs are valid and load correctly
- Pricing matches Beds24
- SEO descriptions match updated room/guest counts

**Files to change:**
- `scripts/import-beds24-properties.ts` (new)
- `src/lib/holidays/data/fallback.ts` (Step 1: add Casa Faro + Villa Molinar; Step 2: update existing properties)

---

## WP6: Correct Room Counts

**Problem:** Casa Luz has `bedrooms: 2` in fallback data, should be `bedrooms: 3`.

**Solution:** Update fallback data. Will be done as part of WP5 (Beds24 import will pull correct values), but also fix immediately:

**Changes in `src/lib/holidays/data/fallback.ts`:**
- Casa Luz: `bedrooms: 2` → `bedrooms: 3`
- Casa Mar: already correct at `bedrooms: 3, bathrooms: 2`
- **Also update SEO descriptions** that mention "2 bedrooms" / "2 Schlafzimmern" / "2 dormitorios" for Casa Luz to reflect the correct count of 3

---

## WP7: FAQ Content

**Problem:** Current FAQs are placeholder content ("In version 1 the deposit is 30%..."). Andreas asks whether we have a template or should create one.

**Solution:** Create proper FAQ content for a vacation rental platform. Topics:

1. **Deposit & Payment** — How much is the deposit? When is the rest due?
2. **Cancellation** — What's the cancellation policy?
3. **Check-in / Check-out** — What are the times? Late check-in possible?
4. **Live Availability** — Are prices and dates real-time?
5. **Cleaning** — Is final cleaning included?
6. **Pets** — Are pets allowed?
7. **Parking** — Is there parking?
8. **Airport Transfer** — How to get from the airport?

**Implementation:**
- Update `fallbackFaqs` in `src/lib/holidays/data/fallback.ts` with 6-8 professional FAQ entries in all 3 languages
- Tone: factual, friendly, concise — matching the site's personality
- Content must be accurate for the actual business (30% deposit, Mallorca tourist tax, flexible cancellation per property, etc.)

**Files to change:**
- `src/lib/holidays/data/fallback.ts` (replace placeholder FAQs)

---

## WP8: Guest Reviews (Deferred)

**Problem:** Andreas asks about integrating Airbnb/Booking.com reviews.

**Reality:** Neither platform offers a public API for fetching reviews to display on third-party sites.

**Recommended approach (for future implementation):**
- **Phase 1:** New Payload CMS collection `Reviews` with fields: guestName, text (localized), rating (1-5), propertyId (relation), source (Airbnb/Booking/Direct), date
- **Phase 2:** Manually curate the best reviews from Airbnb/Booking.com
- **Phase 3:** Review component on property detail page (below amenities/house rules)
- **Phase 4:** Aggregate rating display on property cards

**This is NOT part of the current implementation.** It should be a separate spec and plan.

---

## Dependency Order

```
WP4 (phone)     ─┐
WP6 (room counts) ├─ can be done immediately, no dependencies
WP1 (calendar)   ─┘

WP5 (import) ─── requires Beds24 API access (env vars configured)
  └── WP6 is subsumed by WP5 if done together

WP2 (minStay) ─── independent, requires API + frontend change

WP3 (guest capacity) ─── independent, simple UI change

WP7 (FAQ) ─── independent, content work

WP8 (reviews) ─── deferred to separate spec
```

**Recommended execution order:**
1. WP4 + WP6 (trivial data fixes, ship immediately)
2. WP1 (calendar CSS fix)
3. WP3 (simplify property cards)
4. WP2 (minimum-stay hint)
5. WP5 (Beds24 property import — largest piece)
6. WP7 (FAQ content)
7. WP8 (reviews — separate project)
