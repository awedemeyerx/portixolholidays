# Andreas Feedback Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 UI/data issues from Andreas's feedback: calendar navigation overlap, minimum-stay error messages, property card simplification, phone number fix, room count correction, and FAQ content replacement.

**Architecture:** Mostly independent changes across fallback data, i18n messages, a service refactor (quote.ts), and two UI component updates (date-range-picker, property-card). WP5 (Beds24 property import) and WP8 (reviews) are deferred to separate plans.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, next-intl, Zod

**Spec:** `docs/superpowers/specs/2026-03-25-andreas-feedback-fixes-design.md`

**Scope exclusions:**
- **WP5** (Beds24 property import) — requires API access, separate plan
- **WP8** (guest reviews) — deferred to separate spec entirely

---

## Task 1: Fix Phone Number + Room Counts (WP4 + WP6)

**Files:**
- Modify: `src/lib/holidays/data/fallback.ts:6` (supportPhone)
- Modify: `src/lib/holidays/data/fallback.ts:177` (Casa Luz bedrooms)
- Modify: `src/lib/holidays/data/fallback.ts:212-214` (Casa Luz SEO descriptions)

- [ ] **Step 1: Fix supportPhone**

In `fallback.ts` line 6, change:
```typescript
supportPhone: '+34 971 000 000',
```
to:
```typescript
supportPhone: '+34 871 180 796',
```

- [ ] **Step 2: Fix Casa Luz bedroom count**

In `fallback.ts` line 177, change:
```typescript
bedrooms: 2,
```
to:
```typescript
bedrooms: 3,
```

- [ ] **Step 3: Fix Casa Luz SEO descriptions to reflect 3 bedrooms**

In `fallback.ts` lines 212-214, change:
```typescript
seoDescription: {
  de: 'Helles Haus in Portixol mit Terrasse, 2 Schlafzimmern und direktem Zugang zur Promenade.',
  en: 'Bright Portixol home with terrace, 2 bedrooms and fast access to the promenade.',
  es: 'Casa luminosa en Portixol con terraza, 2 dormitorios y acceso rápido al paseo.',
},
```
to:
```typescript
seoDescription: {
  de: 'Helles Haus in Portixol mit Terrasse, 3 Schlafzimmern und direktem Zugang zur Promenade.',
  en: 'Bright Portixol home with terrace, 3 bedrooms and fast access to the promenade.',
  es: 'Casa luminosa en Portixol con terraza, 3 dormitorios y acceso rápido al paseo.',
},
```

- [ ] **Step 4: Verify dev server starts**

Run: `npm run dev`
Expected: No TypeScript errors, server starts.

- [ ] **Step 5: Commit**

```bash
git add src/lib/holidays/data/fallback.ts
git commit -m "fix: correct phone number and Casa Luz bedroom count"
```

---

## Task 2: Calendar Navigation Overlap (WP1)

**Files:**
- Modify: `src/components/search/date-range-picker.tsx:308-335` (restructure header)

The current layout has `<` / `>` buttons and status text sharing a single `flex justify-between` row above the calendar grid. The fix moves nav buttons into each month panel's title row.

- [ ] **Step 1: Remove nav buttons from the header bar**

In `date-range-picker.tsx`, the header bar (lines ~308-335) currently contains the status text on the left and prev/next buttons on the right. Replace the entire header `<div>` with one that only has the status text and a "Clear dates" button (if applicable).

Replace the header div (lines 308-335):
```tsx
<div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
  <div className="text-sm text-ink/68">
    {invalidRange
      ? labels.invalidRange
      : hasValidRange
        ? `${totalNights} ${labels.nights}`
        : checkIn
          ? labels.selectDeparture
          : labels.selectArrival}
  </div>
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
      disabled={!canGoPrev}
      className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {'<'}
    </button>
    <button
      type="button"
      onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
      className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5"
    >
      {'>'}
    </button>
  </div>
</div>
```
with:
```tsx
<div className="flex items-center justify-center border-b border-ink/8 px-4 py-3">
  <div className="text-sm text-ink/68">
    {invalidRange
      ? labels.invalidRange
      : hasValidRange
        ? `${totalNights} ${labels.nights}`
        : checkIn
          ? labels.selectDeparture
          : labels.selectArrival}
  </div>
</div>
```

- [ ] **Step 2: Add prev/next buttons flanking each month label**

In the month panel rendering (the `monthViews.map(...)` block), the month label is currently:
```tsx
<div className="flex items-center justify-between">
  <h3 className="font-serif text-2xl capitalize">{label}</h3>
</div>
```

Replace it to add nav buttons. For the **first** month panel, add `<` on the left. For the **last** month panel, add `>` on the right. Use the `index` from `monthViews.map()`:

```tsx
{monthViews.map(({ label, cells: monthCells }, index) => {
  const isFirst = index === 0;
  const isLast = index === monthViews.length - 1;
  return (
    <div key={label} className="space-y-3">
      <div className="flex items-center justify-between">
        {isFirst ? (
          <button
            type="button"
            onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
            disabled={!canGoPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {'<'}
          </button>
        ) : (
          <span />
        )}
        <h3 className="font-serif text-2xl capitalize">{label}</h3>
        {isLast ? (
          <button
            type="button"
            onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5"
          >
            {'>'}
          </button>
        ) : (
          <span />
        )}
      </div>
      {/* weekday header + grid unchanged */}
```

Note: On mobile (single month panel), `isFirst` and `isLast` are both true for the same panel, so both buttons appear — which is correct.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Check: Open date picker on both desktop (2 months) and mobile viewport (1 month).
Expected: Nav buttons flank month labels. Status text is centered in the header. No overlap.

- [ ] **Step 4: Commit**

```bash
git add src/components/search/date-range-picker.tsx
git commit -m "fix: move calendar nav buttons into month title rows to prevent overlap"
```

---

## Task 3: Property Cards — Show Only Guest Capacity (WP3)

**Files:**
- Modify: `src/components/search/property-card.tsx:9-17` (remove beds/baths from labels type)
- Modify: `src/components/search/property-card.tsx:58-62` (remove beds/baths display)
- Modify: `src/components/search/search-shell.tsx` (remove beds/baths label props)

**Note:** The spec mentions moving bedroom/bathroom counts into property description text. This is deferred — WP5 (Beds24 import) will pull fresh descriptions that already contain room details. The property detail page already shows room info in highlights/amenities.

- [ ] **Step 1: Update labels type in property-card.tsx**

In `property-card.tsx`, change the `labels` type (lines 9-17) from:
```typescript
labels: {
  pricePerNight: string;
  total: string;
  deposit: string;
  select: string;
  beds: string;
  baths: string;
  guestsMax: string;
};
```
to:
```typescript
labels: {
  pricePerNight: string;
  total: string;
  deposit: string;
  select: string;
  guestsMax: string;
};
```

- [ ] **Step 2: Update stats display in property-card.tsx**

Replace the stats div (lines 58-62):
```tsx
<div className="flex flex-wrap gap-3 text-sm text-ink/70">
  <span>{property.bedrooms} {labels.beds}</span>
  <span>{property.bathrooms} {labels.baths}</span>
  <span>{property.maxGuests} {labels.guestsMax}</span>
</div>
```
with:
```tsx
<div className="text-sm text-ink/70">
  <span>{property.maxGuests} {labels.guestsMax}</span>
</div>
```

- [ ] **Step 3: Remove beds/baths from search-shell.tsx labels**

In `search-shell.tsx`, find the `labels` prop passed to `PropertyCard` (around line 278-285) and remove the `beds` and `baths` entries:
```typescript
labels={{
  pricePerNight: t('pricePerNight'),
  total: t('total'),
  deposit: t('deposit'),
  select: t('select'),
  beds: t('beds'),
  baths: t('baths'),
  guestsMax: t('guestsMax'),
}}
```
becomes:
```typescript
labels={{
  pricePerNight: t('pricePerNight'),
  total: t('total'),
  deposit: t('deposit'),
  select: t('select'),
  guestsMax: t('guestsMax'),
}}
```

- [ ] **Step 4: Check for any other call sites**

Run: `grep -r "labels.beds\|labels.baths" src/` — should return no results.

- [ ] **Step 5: Verify in browser**

Run: `npm run dev`
Expected: Property cards show only "4 max guests" (no bedroom/bathroom count).

- [ ] **Step 6: Commit**

```bash
git add src/components/search/property-card.tsx src/components/search/search-shell.tsx
git commit -m "feat: simplify property cards to show only guest capacity"
```

---

## Task 4: Minimum-Stay Hint (WP2)

**Files:**
- Modify: `src/lib/holidays/services/quote.ts` (add QuoteResult type, minStay check)
- Modify: `src/app/api/properties/[slug]/quote/route.ts` (use structured result)
- Modify: `src/components/property/booking-panel.tsx:106-121` (handle min_stay error)
- Modify: `src/messages/en.json`, `src/messages/de.json`, `src/messages/es.json`

### Sub-task 4a: Refactor quote service return type

- [ ] **Step 1: Add QuoteResult type and minStay check to quote.ts**

At the top of `src/lib/holidays/services/quote.ts`, after the imports, add:
```typescript
export type QuoteResult =
  | { ok: true; quote: PropertyQuote }
  | { ok: false; reason: 'not_found' | 'min_stay' | 'unavailable'; minStay?: number; nights?: number };
```

- [ ] **Step 2: Refactor getPropertyQuoteBySlug to return QuoteResult**

Change the function signature and early returns:
```typescript
export async function getPropertyQuoteBySlug(
  slug: string,
  query: SearchQuery,
  options?: { forceLive?: boolean },
): Promise<QuoteResult> {
  const property = await getPropertyBySlug(slug, query.locale);
  if (!property) return { ok: false, reason: 'not_found' };
  if (query.guests > property.maxGuests) return { ok: false, reason: 'not_found' };

  const localized = localizeProperty(property, query.locale);
  const nights = diffNights(query.checkIn, query.checkOut);
  if (nights <= 0) return { ok: false, reason: 'not_found' };

  // Check minimum stay
  if (nights < property.pricing.minStay) {
    return { ok: false, reason: 'min_stay', minStay: property.pricing.minStay, nights };
  }
```

Change the existing `return null` for snapshot failure to:
```typescript
  if (!priced) return { ok: false, reason: 'unavailable' };
```

Wrap existing successful returns with `{ ok: true, quote: ... }`:
```typescript
  return { ok: true, quote: liveQuote };
  // and
  return { ok: true, quote: { ... } satisfies PropertyQuote };
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Errors in `quote/route.ts` and any callers of `getPropertyQuoteBySlug` (expected — we fix those next).

### Sub-task 4b: Update the API route

- [ ] **Step 4: Update quote API route to use QuoteResult**

In `src/app/api/properties/[slug]/quote/route.ts`, replace the existing quote handling:
```typescript
const quote = await getPropertyQuoteBySlug(slug, parsed.data);
if (!quote) {
  return NextResponse.json({ error: 'Property quote not found.' }, { status: 404 });
}

return NextResponse.json(quote, {
```
with:
```typescript
const result = await getPropertyQuoteBySlug(slug, parsed.data);
if (!result.ok) {
  if (result.reason === 'min_stay') {
    return NextResponse.json(
      { error: 'min_stay', minStay: result.minStay, nights: result.nights },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'Property quote not found.' }, { status: 404 });
}

return NextResponse.json(result.quote, {
```

### Sub-task 4b2: Update all other callers

There are 4 additional call sites that must be updated:

- [ ] **Step 5: Update booking.ts — buildBookingSession type (line 79)**

In `src/lib/holidays/services/booking.ts`, the type annotation on line 79:
```typescript
quote: NonNullable<Awaited<ReturnType<typeof getPropertyQuoteBySlug>>>;
```
Change to use the concrete type directly:
```typescript
quote: PropertyQuote;
```
Add the import at the top of the file:
```typescript
import type { PropertyQuote } from '../types';
```

- [ ] **Step 6: Update booking.ts — createCheckoutForBooking snapshot quote (line 112-113)**

In `src/lib/holidays/services/booking.ts`, replace:
```typescript
const snapshotQuote = await getPropertyQuoteBySlug(slug, query);
if (!snapshotQuote || !snapshotQuote.available) {
```
with:
```typescript
const snapshotResult = await getPropertyQuoteBySlug(slug, query);
if (!snapshotResult.ok || !snapshotResult.quote.available) {
```
And update the reference on line 131 from `quote: snapshotQuote,` to `quote: snapshotResult.quote,`.

- [ ] **Step 7: Update booking.ts — createCheckoutForBooking live quote (lines 142-156)**

Replace:
```typescript
const liveQuote = await getPropertyQuoteBySlug(slug, query, { forceLive: true });
if (!liveQuote || !liveQuote.available) {
```
with:
```typescript
const liveResult = await getPropertyQuoteBySlug(slug, query, { forceLive: true });
if (!liveResult.ok || !liveResult.quote.available) {
```
And update the reference on line 156 from `quote: liveQuote,` to `quote: liveResult.quote,`.

- [ ] **Step 8: Update booking.ts — finalizeStripeCheckout (lines 275-283)**

Replace:
```typescript
const liveQuote = await getPropertyQuoteBySlug(session.propertySlug, session.query, { forceLive: true });
```
and:
```typescript
if (
  !liveQuote ||
  !liveQuote.available ||
  toMinorUnits(liveQuote.quote.totalPrice) !== toMinorUnits(session.quote.quote.totalPrice) ||
  toMinorUnits(liveQuote.quote.depositAmount) !== toMinorUnits(session.quote.quote.depositAmount)
) {
```
with:
```typescript
const liveResult = await getPropertyQuoteBySlug(session.propertySlug, session.query, { forceLive: true });
```
and:
```typescript
if (
  !liveResult.ok ||
  !liveResult.quote.available ||
  toMinorUnits(liveResult.quote.quote.totalPrice) !== toMinorUnits(session.quote.quote.totalPrice) ||
  toMinorUnits(liveResult.quote.quote.depositAmount) !== toMinorUnits(session.quote.quote.depositAmount)
) {
```
Also update any later references to `liveQuote` in the same function to `liveResult.quote`.

- [ ] **Step 9: Update property detail page (line 60)**

In `src/app/[locale]/properties/[slug]/page.tsx`, replace:
```typescript
const quote = parsed.success ? await getPropertyQuoteBySlug(slug, parsed.data) : null;
```
with:
```typescript
const quoteResult = parsed.success ? await getPropertyQuoteBySlug(slug, parsed.data) : null;
const quote = quoteResult?.ok ? quoteResult.quote : null;
```

- [ ] **Step 10: Verify TypeScript compiles clean**

Run: `npx tsc --noEmit`
Expected: No errors.

### Sub-task 4c: Update booking panel error handling

- [ ] **Step 11: Update booking-panel.tsx to show min_stay message**

In `src/components/property/booking-panel.tsx`, replace lines 106-121. Handle the min_stay case directly in the non-ok branch instead of using throw/catch for control flow:

Replace:
```typescript
.then(async (response) => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(String(payload.error ?? 'Quote fetch failed'));
  }
  return response.json() as Promise<PropertyQuote>;
})
.then((nextQuote) => {
  if (requestIdRef.current !== requestId) return;
  setActiveQuote(nextQuote);
})
.catch(() => {
  if (requestIdRef.current !== requestId) return;
  setActiveQuote(null);
  setQuoteError(t('quoteUnavailable'));
})
```
with:
```typescript
.then(async (response) => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (requestIdRef.current !== requestId) return;
    setActiveQuote(null);
    if (payload.error === 'min_stay') {
      setQuoteError(t('quoteMinStay', { minStay: payload.minStay, nights: payload.nights }));
    } else {
      setQuoteError(t('quoteUnavailable'));
    }
    return;
  }
  const nextQuote = (await response.json()) as PropertyQuote;
  if (requestIdRef.current !== requestId) return;
  setActiveQuote(nextQuote);
})
.catch(() => {
  if (requestIdRef.current !== requestId) return;
  setActiveQuote(null);
  setQuoteError(t('quoteUnavailable'));
})
```

### Sub-task 4d: Add i18n keys

- [ ] **Step 12: Add quoteMinStay to all 3 locale files**

In `src/messages/en.json`, inside the `"Property"` section, after `"quoteUnavailable"`, add:
```json
"quoteMinStay": "This property requires a minimum stay of {minStay} nights. You selected {nights}."
```

In `src/messages/de.json`:
```json
"quoteMinStay": "Dieses Objekt erfordert einen Mindestaufenthalt von {minStay} Nächten. Du hast {nights} gewählt."
```

In `src/messages/es.json`:
```json
"quoteMinStay": "Este alojamiento requiere una estancia mínima de {minStay} noches. Has seleccionado {nights}."
```

- [ ] **Step 13: Verify TypeScript compiles and dev server starts**

Run: `npx tsc --noEmit && npm run dev`
Expected: Clean compile, server starts.

- [ ] **Step 14: Commit**

```bash
git add src/lib/holidays/services/quote.ts src/lib/holidays/services/booking.ts src/app/api/properties/[slug]/quote/route.ts "src/app/[locale]/properties/[slug]/page.tsx" src/components/property/booking-panel.tsx src/messages/en.json src/messages/de.json src/messages/es.json
git commit -m "feat: show minimum-stay hint instead of generic quote error"
```

---

## Task 5: Replace FAQ Content (WP7)

**Files:**
- Modify: `src/lib/holidays/data/fallback.ts:66-109` (replace fallbackFaqs array)

- [ ] **Step 1: Replace fallbackFaqs with professional content**

Replace the entire `fallbackFaqs` array in `fallback.ts` (lines 66-109) with:

```typescript
export const fallbackFaqs: FAQEntry[] = [
  {
    id: 'faq-deposit',
    order: 1,
    question: {
      de: 'Wie hoch ist die Anzahlung?',
      en: 'How much is the deposit?',
      es: '¿De cuánto es el depósito?',
    },
    answer: {
      de: 'Bei der Buchung wird eine Anzahlung von 30 % des Gesamtpreises fällig. Der Restbetrag ist spätestens 14 Tage vor Anreise per Überweisung oder vor Ort zu zahlen.',
      en: 'A deposit of 30% of the total price is due at booking. The remaining balance must be paid by bank transfer at least 14 days before arrival, or on site.',
      es: 'Al reservar se abona un depósito del 30 % del precio total. El resto se paga por transferencia al menos 14 días antes de la llegada, o en el alojamiento.',
    },
  },
  {
    id: 'faq-cancellation',
    order: 2,
    question: {
      de: 'Was sind die Stornierungsbedingungen?',
      en: 'What is the cancellation policy?',
      es: '¿Cuál es la política de cancelación?',
    },
    answer: {
      de: 'Die Stornierungsfrist variiert je nach Objekt und ist auf der jeweiligen Detailseite angegeben. Bei kostenfreier Stornierung innerhalb der Frist wird die Anzahlung vollständig erstattet.',
      en: 'The cancellation deadline varies by property and is shown on the relevant detail page. If you cancel within the free cancellation period, your deposit is refunded in full.',
      es: 'El plazo de cancelación varía según el alojamiento y se indica en la página de detalle. Si cancelas dentro del plazo gratuito, el depósito se reembolsa íntegramente.',
    },
  },
  {
    id: 'faq-checkin',
    order: 3,
    question: {
      de: 'Wann kann ich einchecken und auschecken?',
      en: 'What are the check-in and check-out times?',
      es: '¿Cuáles son las horas de check-in y check-out?',
    },
    answer: {
      de: 'Check-in ist ab 16:00 Uhr, Check-out bis 10:00 Uhr. Späterer Check-in ist nach Absprache möglich — kontaktiere uns einfach nach der Buchung.',
      en: 'Check-in is from 4:00 PM, check-out by 10:00 AM. Later check-in is possible by arrangement — just contact us after booking.',
      es: 'El check-in es a partir de las 16:00 h, el check-out hasta las 10:00 h. Es posible un check-in más tarde con coordinación previa — contáctanos tras la reserva.',
    },
  },
  {
    id: 'faq-live',
    order: 4,
    question: {
      de: 'Sind Preise und Verfügbarkeit in Echtzeit?',
      en: 'Are prices and availability shown in real time?',
      es: '¿Los precios y la disponibilidad se muestran en tiempo real?',
    },
    answer: {
      de: 'Ja. Unsere Kalender und Preise werden laufend mit dem Buchungssystem synchronisiert. Vor dem Abschluss wird deine Auswahl nochmals geprüft, damit deine Buchung aktuell bleibt.',
      en: 'Yes. Our calendars and prices are continuously synced with the booking system. Before checkout, your selection is verified again to ensure your booking stays current.',
      es: 'Sí. Nuestros calendarios y precios se sincronizan continuamente con el sistema de reservas. Antes de finalizar, tu selección se verifica de nuevo para que la reserva esté actualizada.',
    },
  },
  {
    id: 'faq-cleaning',
    order: 5,
    question: {
      de: 'Ist die Endreinigung im Preis enthalten?',
      en: 'Is the final cleaning included in the price?',
      es: '¿La limpieza final está incluida en el precio?',
    },
    answer: {
      de: 'Ja. Bei jedem Objekt ist eine professionelle Endreinigung inklusive. Die Reinigungsgebühr wird in der Preisaufstellung separat ausgewiesen.',
      en: 'Yes. A professional final cleaning is included with every property. The cleaning fee is shown as a separate line item in the price breakdown.',
      es: 'Sí. Cada alojamiento incluye una limpieza final profesional. La tarifa de limpieza aparece como partida separada en el desglose del precio.',
    },
  },
  {
    id: 'faq-pets',
    order: 6,
    question: {
      de: 'Sind Haustiere erlaubt?',
      en: 'Are pets allowed?',
      es: '¿Se admiten mascotas?',
    },
    answer: {
      de: 'Das hängt vom Objekt ab. Die Hausregeln auf der Detailseite geben Auskunft. Bei Fragen kontaktiere uns gerne vorab.',
      en: 'It depends on the property. Check the house rules on the detail page. If in doubt, feel free to contact us beforehand.',
      es: 'Depende del alojamiento. Consulta las normas de la casa en la página de detalle. Si tienes dudas, no dudes en contactarnos previamente.',
    },
  },
  {
    id: 'faq-parking',
    order: 7,
    question: {
      de: 'Gibt es einen Parkplatz?',
      en: 'Is there parking?',
      es: '¿Hay aparcamiento?',
    },
    answer: {
      de: 'Einige Objekte bieten einen Stellplatz oder Garagenplatz. Ob Parkmöglichkeiten vorhanden sind, steht in den Ausstattungsdetails auf der Detailseite.',
      en: 'Some properties offer a parking space or garage. Whether parking is available is listed in the amenities section on the detail page.',
      es: 'Algunos alojamientos disponen de plaza de aparcamiento o garaje. La disponibilidad de parking se indica en los servicios de la página de detalle.',
    },
  },
  {
    id: 'faq-airport',
    order: 8,
    question: {
      de: 'Wie komme ich vom Flughafen zur Unterkunft?',
      en: 'How do I get from the airport to the property?',
      es: '¿Cómo llego del aeropuerto al alojamiento?',
    },
    answer: {
      de: 'Der Flughafen Palma de Mallorca (PMI) liegt rund 15 Minuten von unseren Objekten entfernt. Taxis, Mietwagen und der EMT-Bus (Linie 1 Richtung Zentrum) sind direkt am Terminal verfügbar.',
      en: 'Palma de Mallorca airport (PMI) is about 15 minutes from our properties. Taxis, rental cars and the EMT bus (line 1 towards the centre) are available right at the terminal.',
      es: 'El aeropuerto de Palma de Mallorca (PMI) está a unos 15 minutos de nuestros alojamientos. Taxis, coches de alquiler y el autobús EMT (línea 1 dirección centro) están disponibles en la terminal.',
    },
  },
];
```

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: Homepage FAQ section renders the new content.

- [ ] **Step 3: Commit**

```bash
git add src/lib/holidays/data/fallback.ts
git commit -m "feat: replace placeholder FAQs with professional vacation rental content"
```

---

## Summary

| Task | WP | Description | Files changed |
|------|----|-------------|---------------|
| 1 | 4+6 | Phone number + room counts | `fallback.ts` |
| 2 | 1 | Calendar navigation overlap | `date-range-picker.tsx` |
| 3 | 3 | Property cards — guests only | `property-card.tsx`, `search-shell.tsx` |
| 4 | 2 | Minimum-stay hint | `quote.ts`, `booking.ts`, `quote/route.ts`, `page.tsx`, `booking-panel.tsx`, 3x messages JSON |
| 5 | 7 | FAQ content | `fallback.ts` |

**Total commits:** 5
**Deferred:** WP5 (Beds24 import), WP8 (reviews)
