# Legal Pages + Cookie Banner — Design Spec

**Date:** 2026-03-26
**Scope:** Replace placeholder legal pages with real content, add cookie banner component

---

## Company Data

All legal pages reference:

- **Operator:** Predator SLU
- **Managing Director:** Arnd v. Wedemeyer
- **Address:** Carrer Vicari Joaquin Fuster, 31, 07006 Palma, Illes Baleares, Spain
- **Phone:** +34 871 180 796
- **Email:** hola@portixolholidays.com
- **CIF:** B57963829
- **VAT ID:** ESB57963829
- **Registro Mercantil de Palma de Mallorca:** T 2657, F 198, S 8, H PM 78716, I/A 1

**Brand context:** "Portixol Holidays" is the consumer-facing brand operated by Predator SLU.

---

## WP1: Impressum (`/legal/imprint`)

Three-language imprint page. Factual, structured layout.

**Content (DE):**

```
Angaben gemäß § 5 TMG und Art. 10 LSSI-CE

Betreiber
Predator SLU
Carrer Vicari Joaquin Fuster, 31
07006 Palma, Illes Baleares
Spanien

Vertretungsberechtigter Geschäftsführer
Arnd v. Wedemeyer

Kontakt
Telefon: +34 871 180 796
E-Mail: hola@portixolholidays.com

Handelsregister
Registro Mercantil de Palma de Mallorca
Tomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1

Umsatzsteuer-Identifikationsnummer
CIF: B57963829
USt-IdNr.: ESB57963829

Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
Arnd v. Wedemeyer (Anschrift wie oben)

EU-Streitbeilegung
Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/
Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
```

**Content (EN):**

```
Legal Notice pursuant to § 5 TMG and Art. 10 LSSI-CE

Operator
Predator SLU
Carrer Vicari Joaquin Fuster, 31
07006 Palma, Illes Baleares
Spain

Managing Director
Arnd v. Wedemeyer

Contact
Phone: +34 871 180 796
Email: hola@portixolholidays.com

Commercial Register
Registro Mercantil de Palma de Mallorca
Volume 2657, Folio 198, Section 8, Sheet PM 78716, Entry 1

Tax Identification
CIF: B57963829
VAT ID: ESB57963829

Responsible for Content pursuant to § 18(2) MStV
Arnd v. Wedemeyer (address as above)

EU Online Dispute Resolution
The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/
We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration body.
```

**Content (ES):**

```
Aviso legal conforme al Art. 10 LSSI-CE

Titular
Predator SLU
Carrer Vicari Joaquin Fuster, 31
07006 Palma, Illes Baleares
España

Administrador
Arnd v. Wedemeyer

Contacto
Teléfono: +34 871 180 796
Correo electrónico: hola@portixolholidays.com

Registro Mercantil
Registro Mercantil de Palma de Mallorca
Tomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1

Identificación fiscal
CIF: B57963829
NIF-IVA: ESB57963829

Responsable del contenido
Arnd v. Wedemeyer (dirección indicada arriba)

Resolución de litigios en línea de la UE
La Comisión Europea ofrece una plataforma de resolución de litigios en línea (ODR): https://ec.europa.eu/consumers/odr/
No estamos obligados ni dispuestos a participar en un procedimiento de resolución de litigios ante una junta de arbitraje de consumo.
```

**Files to change:**
- `src/lib/holidays/data/fallback.ts` — replace `fallbackLegalPages[0]` (imprint) body content

---

## WP2: Datenschutzerklärung (`/legal/privacy`)

Comprehensive privacy policy reflecting the actual data flows in the Portixol Holidays platform. Three languages.

**Structure and content for each section:**

### Section 1: Verantwortlicher / Controller

Predator SLU, full address and contact details (as above). Data Protection contact: hola@portixolholidays.com.

### Section 2: Erhobene Daten / Data Collected

| Data | When | Purpose |
|------|------|---------|
| First name, last name | Booking form | Booking, guest identification |
| Email address | Booking form | Booking confirmation, communication |
| Phone number | Booking form | Guest communication |
| NIE/DNI/CIF (optional) | Booking form | Spanish tax/legal requirements |
| Special requests | Booking form | Guest service |
| IP address, browser/device info | Automatic (server logs) | Security, error analysis |
| Page views, funnel events | Automatic (Vercel Analytics) | Anonymous usage analysis (no cookies, no personal data) |

### Section 3: Zwecke und Rechtsgrundlagen / Purposes and Legal Basis

| Purpose | Legal basis |
|---------|-------------|
| Booking processing, payment, guest communication | Art. 6(1)(b) GDPR — contract fulfillment |
| Website security, error analysis | Art. 6(1)(f) GDPR — legitimate interest |
| Anonymous usage statistics (Vercel Analytics) | Art. 6(1)(f) GDPR — legitimate interest (cookieless, no personal data) |

### Section 4: Auftragsverarbeiter / Data Processors

| Service | Provider | Location | Purpose | Safeguards |
|---------|----------|----------|---------|------------|
| Hosting & Analytics | Vercel Inc. | USA | Website hosting, cookieless analytics | DPA, Standard Contractual Clauses |
| Database | Supabase Inc. | AWS EU (Frankfurt) | Booking data, inventory | DPA, EU data residency |
| Payments | Stripe Inc. | USA / EU | 30% deposit processing | DPA, Standard Contractual Clauses, PCI DSS |
| Booking Management | Beds24 (Inntopia OG) | Berlin, Germany | Calendar, availability, booking creation | DPA, EU data processing |
| Transactional Email | Brevo (Sendinblue) | Paris, France | Booking confirmation emails | DPA, EU data processing |

### Section 5: Cookies

This website uses only technically necessary cookies:

| Cookie | Purpose | Duration | Legal basis |
|--------|---------|----------|-------------|
| Locale preference | Remembers selected language (de/en/es) | Session | Art. 6(1)(f) GDPR — legitimate interest |
| Cookie notice dismissed | Remembers that cookie notice was acknowledged | 1 year (localStorage) | Art. 6(1)(f) GDPR — legitimate interest |

No tracking cookies, no marketing cookies, no third-party cookies. Vercel Analytics is fully cookieless.

### Section 6: Drittlandtransfers / Third-Country Transfers

Personal data is transferred to the USA via Stripe and Vercel. Safeguards:
- EU Standard Contractual Clauses (SCCs)
- Data Processing Agreements (DPAs) with each provider
- Additional technical measures (encryption in transit and at rest)

### Section 7: Speicherdauer / Data Retention

| Data | Retention |
|------|-----------|
| Booking data (name, email, dates, payment) | 10 years (Spanish tax law, Ley General Tributaria) |
| Server logs (IP, browser) | 30 days |
| Analytics data | Aggregated/anonymous, no personal data stored |

### Section 8: Betroffenenrechte / Data Subject Rights

- Right of access (Art. 15 GDPR)
- Right to rectification (Art. 16 GDPR)
- Right to erasure (Art. 17 GDPR)
- Right to restriction of processing (Art. 18 GDPR)
- Right to data portability (Art. 20 GDPR)
- Right to object (Art. 21 GDPR)
- Right to withdraw consent (Art. 7(3) GDPR)

Contact: hola@portixolholidays.com

### Section 9: Aufsichtsbehörde / Supervisory Authority

Agencia Española de Protección de Datos (AEPD)
C/ Jorge Juan, 6, 28001 Madrid
https://www.aepd.es

### Section 10: SSL/TLS

This website uses SSL/TLS encryption for all data transmission.

**Content:** Written in full prose for each language (DE/EN/ES), using the structured information above. Each section uses clear headings and short paragraphs. Tables are rendered as text lists since the legal page body uses `whitespace-pre-line`.

**Files to change:**
- `src/lib/holidays/data/fallback.ts` — replace `fallbackLegalPages[1]` (privacy) body content

---

## WP3: AGB / Buchungsbedingungen (`/legal/terms`)

General booking terms for the Portixol Holidays platform. Three languages.

**Sections:**

### § 1 Geltungsbereich / Scope
- These terms apply to all bookings made through portixolholidays.com
- Portixol Holidays is a brand of Predator SLU
- The platform facilitates vacation rental bookings in Mallorca

### § 2 Vertragsschluss / Contract Formation
- Online booking constitutes a binding offer by the guest
- Contract is formed upon receipt of booking confirmation email
- The booking confirmation contains the binding details (property, dates, price, guest data)

### § 3 Preise und Zahlung / Prices and Payment
- All prices in EUR, inclusive of applicable taxes
- Price breakdown: nightly rate + cleaning fee + tourist tax (Impuesto Turístico Sostenible, ITS)
- 30% deposit due at booking (processed via Stripe)
- Remaining 70% due no later than 14 days before arrival (bank transfer or on-site)
- Late payment: the operator reserves the right to cancel the booking

### § 4 Stornierung / Cancellation
- The cancellation period varies by property and is stated on the respective property detail page
- Within the free cancellation period: full refund of the deposit
- After the free cancellation period: the deposit is retained
- Cancellations must be made in writing (email to hola@portixolholidays.com)

### § 5 Anreise und Abreise / Check-in and Check-out
- Check-in: from 16:00
- Check-out: by 10:00
- Late check-in possible by prior arrangement
- Early check-in / late check-out subject to availability

### § 6 Pflichten des Gastes / Guest Obligations
- The property must be left in orderly condition
- The guest is liable for damages caused during the stay
- House rules of the respective property must be observed
- Maximum guest count as stated in the booking must not be exceeded
- Subletting is not permitted

### § 7 Haftung / Liability
- The operator is liable for intent and gross negligence
- Liability for slight negligence is limited to foreseeable, contract-typical damages
- No liability for force majeure, natural disasters, pandemics, strikes, or government orders
- No liability for temporary interruptions of the booking platform

### § 8 Datenschutz / Data Protection
- Reference to the privacy policy at /legal/privacy
- Personal data is processed only for booking fulfillment and guest communication

### § 9 Anwendbares Recht und Gerichtsstand / Applicable Law and Jurisdiction
- Spanish law applies
- Place of jurisdiction: Palma de Mallorca
- For consumers within the EU: mandatory consumer protection regulations of their country of residence remain unaffected

### § 10 Streitbeilegung / Dispute Resolution
- EU Online Dispute Resolution platform: https://ec.europa.eu/consumers/odr/
- The operator is neither obliged nor willing to participate in consumer arbitration proceedings

### § 11 Salvatorische Klausel / Severability
- If any provision is invalid, the remaining provisions continue in effect

**Files to change:**
- `src/lib/holidays/data/fallback.ts` — replace `fallbackLegalPages[2]` (terms) body content

---

## WP4: Cookie Banner Component

### Behavior

- Displays a small bar fixed to the bottom of the viewport
- Shows on every page until the user dismisses it
- Dismissal sets `localStorage.setItem('cookie-notice-dismissed', '1')`
- On subsequent visits, the banner is hidden if the localStorage flag exists
- No opt-in/opt-out needed (only technically necessary cookies)
- Fully localized (DE/EN/ES) via `useTranslations`

### Design

Following the site's design system:
- Fixed bottom bar with `bg-ink text-foam` (dark background, light text)
- Rounded top corners, subtle shadow
- Small text with link to privacy page
- Single "Verstanden" / "Understood" / "Entendido" button in `bg-sea` style
- Compact: single line on desktop, stacked on mobile
- `z-50` to stay above content but below modals

### i18n Keys

New keys in all 3 locale files under a `Cookie` namespace:

```json
{
  "Cookie": {
    "notice": "This website uses only technically necessary cookies.",
    "learnMore": "Privacy policy",
    "dismiss": "Understood"
  }
}
```

| Locale | notice | learnMore | dismiss |
|--------|--------|-----------|---------|
| en | "This website uses only technically necessary cookies." | "Privacy policy" | "Understood" |
| de | "Diese Website verwendet nur technisch notwendige Cookies." | "Datenschutz" | "Verstanden" |
| es | "Este sitio web utiliza solo cookies técnicamente necesarias." | "Privacidad" | "Entendido" |

### Component

- New file: `src/components/cookie-banner.tsx`
- Client Component (`'use client'`)
- Uses `useState` + `useEffect` to check localStorage on mount
- Uses `useTranslations('Cookie')` for i18n
- Uses `useLocale()` to build the privacy page link (`/${locale}/legal/privacy`)
- Renders `null` if already dismissed or during SSR (avoid hydration mismatch)

### Integration

- Import and render `<CookieBanner />` in `src/app/[locale]/layout.tsx`, after the `<SiteFooter />`
- No changes to root layout needed

### Files to change

- `src/components/cookie-banner.tsx` (new)
- `src/app/[locale]/layout.tsx` (add CookieBanner)
- `src/messages/en.json`, `de.json`, `es.json` (add Cookie namespace)

---

## Implementation Notes

### Legal page body format

The `LegalPageRecord.body` field is a `Localized` string rendered with `whitespace-pre-line` CSS. This means:
- Use `\n` for line breaks within the string
- Use `\n\n` for paragraph breaks
- No HTML or Markdown — plain text only
- Section headings are just bold-looking lines (ALL CAPS or with numbering)

### Content length

The privacy policy and terms will be long strings (2000-4000 characters per language). This is expected and necessary for legal compliance.

### Disclaimer

These legal texts are drafts. They should be reviewed by a qualified lawyer before going live, especially the AGB (booking terms) and the privacy policy regarding third-country data transfers.

---

## Dependency Order

```
WP1 (Impressum)    ─┐
WP2 (Datenschutz)   ├─ all independent, modify fallback.ts
WP3 (AGB)           ─┘
WP4 (Cookie Banner) ─── independent, new component + layout change + i18n keys

Recommended order: WP1 → WP2 → WP3 → WP4
(WP1-3 are all fallback.ts edits, WP4 is separate files)
```
