# Legal Pages & Cookie Banner — Progress

Status: **Abgeschlossen** (2026-03-26)

## Erledigte Aufgaben

### WP1: Impressum
- **Commit:** `3fd91b0` feat: add real Impressum content for Predator SLU
- **Datei:** `src/lib/holidays/data/fallback.ts` (slug: `imprint`)
- Echte Firmendaten: Predator SLU, CIF B57963829, Registro Mercantil de Palma
- Dreisprachig (DE/EN/ES), konform mit § 5 TMG und Art. 10 LSSI-CE
- EU-Streitbeilegungsplattform verlinkt

### WP2: Datenschutzerklärung
- **Commit:** `0f782ba` feat: add comprehensive privacy policy for Predator SLU
- **Datei:** `src/lib/holidays/data/fallback.ts` (slug: `privacy`)
- 10 Abschnitte: Verantwortlicher, Datenerhebung, Rechtsgrundlagen, Auftragsverarbeiter (Vercel, Stripe, Beds24), Cookies/localStorage, Drittlandtransfers, Speicherdauer, Betroffenenrechte, AEPD, Verschlüsselung
- Dreisprachig (DE/EN/ES)

### WP3: AGB / Buchungsbedingungen
- **Commit:** `612e228` feat: add booking terms and conditions for Predator SLU
- **Datei:** `src/lib/holidays/data/fallback.ts` (slug: `terms`)
- 11 Paragraphen (§1–§11): Geltungsbereich, Vertragsschluss, Preise/Zahlung, Stornierung, Check-in/out, Gastpflichten, Haftung, Datenschutz, Gerichtsstand, Streitbeilegung, Salvatorische Klausel
- Dreisprachig (DE/EN/ES)

### WP4: Cookie-Banner
- **Commit:** `1572a45` feat: add cookie notice banner with i18n support
- **Neue Datei:** `src/components/cookie-banner.tsx` (Client Component)
- **Geänderte Dateien:**
  - `src/app/[locale]/layout.tsx` — CookieBanner nach SiteFooter eingebunden
  - `src/messages/de.json` — Cookie-Namespace (notice, learnMore, dismiss)
  - `src/messages/en.json` — Cookie-Namespace
  - `src/messages/es.json` — Cookie-Namespace
- Minimalistisch: dunkle Bar am unteren Rand, "Verstanden"-Button, localStorage-Flag `cookie-notice-dismissed`
- Kein Opt-in/Opt-out nötig (nur technisch notwendige Cookies)

## Planungs-Dokumente

- **Spec:** `docs/superpowers/specs/2026-03-26-legal-pages-cookie-banner-design.md`
- **Plan:** `docs/superpowers/plans/2026-03-26-legal-pages-cookie-banner.md`

## Technische Details

- Alle Legal Pages werden aus `fallbackLegalPages` in `fallback.ts` geladen (Payload CMS Fallback)
- Route: `/:locale/legal/:slug` (imprint, privacy, terms)
- TypeScript kompiliert fehlerfrei (`npx tsc --noEmit`)
