# Portixol Holidays

Eigenständiges Next.js-15-Projekt für ein Ferienvermietungsportal mit:

- dreisprachiger Oberfläche (`de`, `en`, `es`)
- eigener Such- und Buchungsmaschine
- Beds24-Integration für Preise, Verfügbarkeiten und finale Buchungen
- Stripe-Anzahlung
- Payload 3 + Postgres als CMS
- serverseitigem JSON-Cache in `/tmp`

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

## Environment

Siehe [`.env.example`](/Users/avwedemeyer/Documents/New project/portixol-holidays/.env.example).

Wichtig:

- Ohne `DATABASE_URL` und `PAYLOAD_SECRET` läuft das Frontend mit eingebauten Fallback-Inhalten.
- Ohne Beds24-Zugang läuft Suche/Quote mit Fallback-Daten.
- Ohne Stripe lässt sich der Checkout nicht final ausführen.

## Verifikation

- `../node_modules/.bin/tsc -p tsconfig.json --noEmit` läuft sauber.
- Ein echter `next build` aus diesem Unterordner hängt aktuell an der übergeordneten Workspace-Installation mit einer `@next/swc`-Versionsabweichung (`15.5.7` vs `15.5.11`). In einem sauberen eigenen Repo mit frischen Projekt-Dependencies sollte das nicht über diese geteilte Parent-Installation laufen.
