# Portixol Holidays

Eigenständiges Next.js-15-Projekt für ein Ferienvermietungsportal mit:

- dreisprachiger Oberfläche (`de`, `en`, `es`)
- eigener Such- und Buchungsmaschine
- Beds24-Integration für Preise, Verfügbarkeiten und finale Buchungen
- Stripe-Anzahlung
- Payload 3 + Postgres als CMS
- persistiertem Beds24-Inventar-Snapshot in Postgres für die nächsten 365 Tage
- serverseitigem JSON-Cache in `/tmp` nur noch für sekundäre Hilfsdaten

## Kernrouten

- `/` -> Redirect anhand `Accept-Language`
- `/:locale` -> Startseite mit Kalender, Gästezahl und Live-Suchergebnissen
- `/:locale/properties/:slug` -> Detailseite mit Quote und Buchungsbereich
- `/:locale/legal/:slug` -> Rechtstexte
- `/admin` -> Payload Admin

## API

- `GET /api/search`
- `GET /api/properties/:slug/quote`
- `POST /api/checkout/session`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/beds24/inventory`
- `POST /api/webhooks/beds24/bookings`
- `POST /api/internal/beds24/sync-inventory`

## Environment

Siehe [`.env.example`](/Users/avwedemeyer/Documents/New project/portixol-holidays/.env.example).

Wichtig:

- Ohne `DATABASE_URL` und `PAYLOAD_SECRET` läuft das Frontend mit eingebauten Fallback-Inhalten.
- Ohne Beds24-Zugang läuft Suche/Quote mit Fallback-Daten.
- Ohne Stripe lässt sich der Checkout nicht final ausführen.
- `BEDS24_SYNC_SECRET` schützt den manuellen Inventory-Sync.
- `CRON_SECRET` schützt den Vercel-Cron-Trigger für `/api/internal/beds24/sync-inventory`.

## Inventory-Sync

- Beds24 `calendar` wird mit `includeNumAvail`, `includePrices`, `includeMinStay`, `includeClosedArrival` und `includeClosedDeparture` gelesen.
- Der Sync schreibt pro Room einen 365-Tage-Snapshot nach `beds24-inventory-snapshots`.
- Suche, Objektkalender und Angebotsquote lesen primär aus dieser Postgres-Collection.
- Erst nach erfolgreicher Stripe-Zahlung erfolgt der finale Live-Recheck gegen Beds24.
- Vercel cron ist in [`vercel.json`](/Users/avwedemeyer/Documents/New project/portixol-holidays/vercel.json) auf alle 30 Minuten gesetzt.

## Verifikation

- `../node_modules/.bin/tsc -p tsconfig.json --noEmit` läuft sauber.
- Ein echter `next build` aus diesem Unterordner hängt aktuell an der übergeordneten Workspace-Installation mit einer `@next/swc`-Versionsabweichung (`15.5.7` vs `15.5.11`). In einem sauberen eigenen Repo mit frischen Projekt-Dependencies sollte das nicht über diese geteilte Parent-Installation laufen.
