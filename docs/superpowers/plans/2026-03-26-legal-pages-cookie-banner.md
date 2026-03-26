# Legal Pages + Cookie Banner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder legal pages (Impressum, Datenschutz, AGB) with real content for Predator SLU / Portixol Holidays, and add a cookie notice banner.

**Architecture:** Tasks 1-3 replace body strings in the `fallbackLegalPages` array in `fallback.ts`. Task 4 adds a new `CookieBanner` client component, i18n keys, and mounts it in the locale layout. All tasks are independent.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-26-legal-pages-cookie-banner-design.md`

---

## Task 1: Impressum (WP1)

**Files:**
- Modify: `src/lib/holidays/data/fallback.ts` — replace body of `slug: 'imprint'` entry

- [ ] **Step 1: Replace imprint body content**

In `src/lib/holidays/data/fallback.ts`, find the entry in `fallbackLegalPages` with `slug: 'imprint'` (currently lines 182-194). Replace only the `body` object. Keep `slug` and `title` unchanged.

Replace:
```typescript
body: {
  de: 'Portixol Holidays\nPalma de Mallorca\nKontakt: hola@portixolholidays.com',
  en: 'Portixol Holidays\nPalma de Mallorca\nContact: hola@portixolholidays.com',
  es: 'Portixol Holidays\nPalma de Mallorca\nContacto: hola@portixolholidays.com',
},
```
with:
```typescript
body: {
  de: 'Angaben gemäß § 5 TMG und Art. 10 LSSI-CE\n\nBetreiber\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nSpanien\n\nVertretungsberechtigter Geschäftsführer\nArnd v. Wedemeyer\n\nKontakt\nTelefon: +34 871 180 796\nE-Mail: hola@portixolholidays.com\n\nHandelsregister\nRegistro Mercantil de Palma de Mallorca\nTomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1\n\nUmsatzsteuer-Identifikationsnummer\nCIF: B57963829\nUSt-IdNr.: ESB57963829\n\nVerantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV\nArnd v. Wedemeyer (Anschrift wie oben)\n\nEU-Streitbeilegung\nDie Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/\nWir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
  en: 'Legal Notice pursuant to § 5 TMG and Art. 10 LSSI-CE\n\nOperator\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nSpain\n\nManaging Director\nArnd v. Wedemeyer\n\nContact\nPhone: +34 871 180 796\nEmail: hola@portixolholidays.com\n\nCommercial Register\nRegistro Mercantil de Palma de Mallorca\nVolume 2657, Folio 198, Section 8, Sheet PM 78716, Entry 1\n\nTax Identification\nCIF: B57963829\nVAT ID: ESB57963829\n\nResponsible for Content pursuant to § 18(2) MStV\nArnd v. Wedemeyer (address as above)\n\nEU Online Dispute Resolution\nThe European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/\nWe are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration body.',
  es: 'Aviso legal conforme al Art. 10 LSSI-CE\n\nTitular\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nEspaña\n\nAdministrador\nArnd v. Wedemeyer\n\nContacto\nTeléfono: +34 871 180 796\nCorreo electrónico: hola@portixolholidays.com\n\nRegistro Mercantil\nRegistro Mercantil de Palma de Mallorca\nTomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1\n\nIdentificación fiscal\nCIF: B57963829\nNIF-IVA: ESB57963829\n\nResponsable del contenido\nArnd v. Wedemeyer (dirección indicada arriba)\n\nResolución de litigios en línea de la UE\nLa Comisión Europea ofrece una plataforma de resolución de litigios en línea (ODR): https://ec.europa.eu/consumers/odr/\nNo estamos obligados ni dispuestos a participar en un procedimiento de resolución de litigios ante una junta de arbitraje de consumo.',
},
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/holidays/data/fallback.ts
git commit -m "feat: add real Impressum content for Predator SLU"
```

---

## Task 2: Datenschutzerklärung (WP2)

**Files:**
- Modify: `src/lib/holidays/data/fallback.ts` — replace body of `slug: 'privacy'` entry

- [ ] **Step 1: Replace privacy policy body content**

In `src/lib/holidays/data/fallback.ts`, find the entry with `slug: 'privacy'`. Also update the `title` to be more descriptive. Replace the entire entry:

```typescript
{
  slug: 'privacy',
  title: {
    de: 'Datenschutzerklärung',
    en: 'Privacy Policy',
    es: 'Política de privacidad',
  },
  body: {
    de: '1. Verantwortlicher\n\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares, Spanien\nE-Mail: hola@portixolholidays.com\nTelefon: +34 871 180 796\n\n2. Welche Daten wir erheben\n\nIm Rahmen einer Buchung erheben wir: Vorname, Nachname, E-Mail-Adresse, Telefonnummer, optional NIE/DNI/CIF sowie Sonderwünsche. Beim Besuch der Website werden automatisch IP-Adresse, Browser- und Geräteinformationen in Server-Logdateien erfasst. Vercel Analytics erfasst anonymisierte Seitenaufrufe ohne Cookies und ohne Personenbezug.\n\n3. Zwecke und Rechtsgrundlagen\n\nBuchungsabwicklung, Zahlung und Gästekommunikation: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).\nWebsite-Sicherheit und Fehleranalyse: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).\nAnonyme Nutzungsstatistiken (Vercel Analytics): Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse; cookielos, kein Personenbezug).\n\n4. Auftragsverarbeiter\n\nVercel Inc. (USA) — Hosting und cookieloses Analytics. Grundlage: Auftragsverarbeitungsvertrag (AVV), EU-Standardvertragsklauseln.\nPostgreSQL via Payload CMS — Datenbank auf Vercel-Infrastruktur. Verwaltung durch den Hosting-Anbieter.\nStripe Inc. (USA/EU) — Zahlungsabwicklung der 30-%-Anzahlung. Grundlage: AVV, EU-Standardvertragsklauseln, PCI DSS.\nBeds24 (Berlin, Deutschland) — Kalenderverwaltung, Verfügbarkeit, Buchungserstellung. Grundlage: AVV, Datenverarbeitung in der EU.\n\n5. Cookies und lokaler Speicher\n\nDiese Website setzt keine Cookies. Die Sprache wird über den URL-Pfad (/de/, /en/, /es/) bestimmt.\nEin einzelner localStorage-Eintrag (cookie-notice-dismissed) speichert, ob der Cookie-Hinweis bestätigt wurde. localStorage-Einträge sind keine Cookies — sie werden nicht mit HTTP-Anfragen übertragen und verbleiben ausschließlich im Browser des Nutzers.\nKeine Tracking-Cookies, keine Marketing-Cookies, keine Drittanbieter-Cookies. Vercel Analytics ist vollständig cookielos.\n\n6. Drittlandtransfers\n\nPersonenbezogene Daten werden über Stripe und Vercel in die USA übermittelt. Schutzmaßnahmen: EU-Standardvertragsklauseln (SCCs), Auftragsverarbeitungsverträge (AVVs), zusätzliche technische Maßnahmen (Verschlüsselung bei Übertragung und Speicherung).\n\n7. Speicherdauer\n\nBuchungsdaten (Name, E-Mail, Daten, Zahlung): 10 Jahre (spanisches Steuerrecht, Ley General Tributaria).\nServer-Logdateien (IP, Browser): 30 Tage.\nAnalytics-Daten: Aggregiert und anonym, keine personenbezogenen Daten gespeichert.\n\n8. Ihre Rechte\n\nSie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch (Art. 21) und Widerruf einer Einwilligung (Art. 7 Abs. 3). Kontakt: hola@portixolholidays.com\n\n9. Aufsichtsbehörde\n\nAgencia Española de Protección de Datos (AEPD)\nC/ Jorge Juan, 6, 28001 Madrid\nhttps://www.aepd.es\n\n10. Verschlüsselung\n\nDiese Website nutzt SSL/TLS-Verschlüsselung für die gesamte Datenübertragung.',
    en: '1. Controller\n\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares, Spain\nEmail: hola@portixolholidays.com\nPhone: +34 871 180 796\n\n2. Data We Collect\n\nWhen you make a booking we collect: first name, last name, email address, phone number, optionally NIE/DNI/CIF, and special requests. When you visit the website, your IP address, browser and device information are automatically recorded in server log files. Vercel Analytics records anonymised page views without cookies and without personal data.\n\n3. Purposes and Legal Basis\n\nBooking processing, payment and guest communication: Art. 6(1)(b) GDPR — contract fulfilment.\nWebsite security and error analysis: Art. 6(1)(f) GDPR — legitimate interest.\nAnonymous usage statistics (Vercel Analytics): Art. 6(1)(f) GDPR — legitimate interest (cookieless, no personal data).\n\n4. Data Processors\n\nVercel Inc. (USA) — hosting and cookieless analytics. Safeguards: Data Processing Agreement (DPA), EU Standard Contractual Clauses.\nPostgreSQL via Payload CMS — database on Vercel infrastructure. Managed by the hosting provider.\nStripe Inc. (USA/EU) — processing the 30% deposit payment. Safeguards: DPA, EU Standard Contractual Clauses, PCI DSS.\nBeds24 (Berlin, Germany) — calendar management, availability, booking creation. Safeguards: DPA, EU data processing.\n\n5. Cookies and Local Storage\n\nThis website does not set any cookies. The language is determined from the URL path (/de/, /en/, /es/).\nA single localStorage entry (cookie-notice-dismissed) records whether the cookie notice has been acknowledged. localStorage entries are not cookies — they are not sent with HTTP requests and remain only in the user\'s browser.\nNo tracking cookies, no marketing cookies, no third-party cookies. Vercel Analytics is fully cookieless.\n\n6. Third-Country Transfers\n\nPersonal data is transferred to the USA via Stripe and Vercel. Safeguards: EU Standard Contractual Clauses (SCCs), Data Processing Agreements (DPAs), additional technical measures (encryption in transit and at rest).\n\n7. Data Retention\n\nBooking data (name, email, dates, payment): 10 years (Spanish tax law, Ley General Tributaria).\nServer logs (IP, browser): 30 days.\nAnalytics data: aggregated and anonymous, no personal data stored.\n\n8. Your Rights\n\nYou have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), objection (Art. 21) and withdrawal of consent (Art. 7(3)). Contact: hola@portixolholidays.com\n\n9. Supervisory Authority\n\nAgencia Española de Protección de Datos (AEPD)\nC/ Jorge Juan, 6, 28001 Madrid\nhttps://www.aepd.es\n\n10. Encryption\n\nThis website uses SSL/TLS encryption for all data transmission.',
    es: '1. Responsable del tratamiento\n\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares, España\nCorreo electrónico: hola@portixolholidays.com\nTeléfono: +34 871 180 796\n\n2. Datos que recogemos\n\nAl realizar una reserva recogemos: nombre, apellidos, dirección de correo electrónico, número de teléfono, opcionalmente NIE/DNI/CIF y solicitudes especiales. Al visitar el sitio web, la dirección IP y la información del navegador y dispositivo se registran automáticamente en los archivos de registro del servidor. Vercel Analytics registra visitas anónimas sin cookies y sin datos personales.\n\n3. Finalidades y base jurídica\n\nGestión de reservas, pago y comunicación con el huésped: Art. 6.1.b) RGPD — ejecución del contrato.\nSeguridad del sitio web y análisis de errores: Art. 6.1.f) RGPD — interés legítimo.\nEstadísticas anónimas de uso (Vercel Analytics): Art. 6.1.f) RGPD — interés legítimo (sin cookies, sin datos personales).\n\n4. Encargados del tratamiento\n\nVercel Inc. (EE. UU.) — alojamiento y analítica sin cookies. Garantías: contrato de tratamiento de datos, cláusulas contractuales tipo de la UE.\nPostgreSQL vía Payload CMS — base de datos en infraestructura de Vercel. Gestionado por el proveedor de alojamiento.\nStripe Inc. (EE. UU./UE) — procesamiento del pago del depósito del 30 %. Garantías: contrato de tratamiento de datos, cláusulas contractuales tipo de la UE, PCI DSS.\nBeds24 (Berlín, Alemania) — gestión de calendario, disponibilidad, creación de reservas. Garantías: contrato de tratamiento de datos, procesamiento de datos en la UE.\n\n5. Cookies y almacenamiento local\n\nEste sitio web no establece ninguna cookie. El idioma se determina a partir de la ruta URL (/de/, /en/, /es/).\nUna única entrada de localStorage (cookie-notice-dismissed) registra si el aviso de cookies ha sido aceptado. Las entradas de localStorage no son cookies: no se envían con las solicitudes HTTP y permanecen únicamente en el navegador del usuario.\nSin cookies de seguimiento, sin cookies de marketing, sin cookies de terceros. Vercel Analytics es completamente sin cookies.\n\n6. Transferencias a terceros países\n\nLos datos personales se transfieren a EE. UU. a través de Stripe y Vercel. Garantías: cláusulas contractuales tipo de la UE (CCT), contratos de tratamiento de datos, medidas técnicas adicionales (cifrado en tránsito y en reposo).\n\n7. Período de conservación\n\nDatos de reserva (nombre, correo, fechas, pago): 10 años (legislación fiscal española, Ley General Tributaria).\nRegistros del servidor (IP, navegador): 30 días.\nDatos de analítica: agregados y anónimos, sin datos personales almacenados.\n\n8. Sus derechos\n\nTiene derecho de acceso (Art. 15 RGPD), rectificación (Art. 16), supresión (Art. 17), limitación del tratamiento (Art. 18), portabilidad de datos (Art. 20), oposición (Art. 21) y retirada del consentimiento (Art. 7.3). Contacto: hola@portixolholidays.com\n\n9. Autoridad de control\n\nAgencia Española de Protección de Datos (AEPD)\nC/ Jorge Juan, 6, 28001 Madrid\nhttps://www.aepd.es\n\n10. Cifrado\n\nEste sitio web utiliza cifrado SSL/TLS para toda la transmisión de datos.',
  },
},
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/holidays/data/fallback.ts
git commit -m "feat: add comprehensive privacy policy for Predator SLU"
```

---

## Task 3: AGB / Buchungsbedingungen (WP3)

**Files:**
- Modify: `src/lib/holidays/data/fallback.ts` — replace body of `slug: 'terms'` entry

- [ ] **Step 1: Replace terms body content**

In `src/lib/holidays/data/fallback.ts`, find the entry with `slug: 'terms'`. Also update the `title` to be more descriptive. Replace the entire entry:

```typescript
{
  slug: 'terms',
  title: {
    de: 'Allgemeine Geschäftsbedingungen',
    en: 'Terms and Conditions',
    es: 'Condiciones generales',
  },
  body: {
    de: '§ 1 Geltungsbereich\nDiese Allgemeinen Geschäftsbedingungen gelten für alle über portixolholidays.com getätigten Buchungen. Portixol Holidays ist eine Marke der Predator SLU, Carrer Vicari Joaquin Fuster 31, 07006 Palma, Illes Baleares, Spanien. Die Plattform vermittelt Ferienvermietungen auf Mallorca.\n\n§ 2 Vertragsschluss\nDie Online-Buchung stellt ein verbindliches Angebot des Gastes dar. Der Vertrag kommt mit Zugang der Buchungsbestätigung per E-Mail zustande. Die Buchungsbestätigung enthält die verbindlichen Angaben zu Objekt, Zeitraum, Preis und Gastdaten.\n\n§ 3 Preise und Zahlung\nAlle Preise verstehen sich in Euro und inklusive der gesetzlichen Mehrwertsteuer. Die Preisaufstellung umfasst: Übernachtungspreis, Reinigungsgebühr und Touristensteuer (Impuesto Turístico Sostenible, ITS). Bei Buchung wird eine Anzahlung von 30 % des Gesamtpreises fällig (Abwicklung über Stripe). Der Restbetrag ist spätestens 14 Tage vor Anreise per Überweisung oder vor Ort zu zahlen. Bei Zahlungsverzug behält sich der Betreiber das Recht vor, die Buchung zu stornieren.\n\n§ 4 Stornierung\nDie Stornierungsfrist variiert je nach Objekt und ist auf der jeweiligen Detailseite angegeben. Bei fristgerechter Stornierung wird die Anzahlung vollständig erstattet. Nach Ablauf der kostenfreien Stornierungsfrist wird die Anzahlung einbehalten. Stornierungen müssen schriftlich erfolgen (E-Mail an hola@portixolholidays.com).\n\n§ 5 Anreise und Abreise\nCheck-in: ab 16:00 Uhr.\nCheck-out: bis 10:00 Uhr.\nSpäterer Check-in ist nach vorheriger Absprache möglich. Früher Check-in und später Check-out sind nach Verfügbarkeit möglich.\n\n§ 6 Pflichten des Gastes\nDas Objekt ist in ordentlichem Zustand zu hinterlassen. Der Gast haftet für Schäden, die während des Aufenthalts verursacht werden. Die Hausordnung des jeweiligen Objekts ist zu beachten. Die in der Buchung angegebene maximale Personenzahl darf nicht überschritten werden. Eine Untervermietung ist nicht gestattet.\n\n§ 7 Haftung\nDer Betreiber haftet für Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf vorhersehbare, vertragstypische Schäden begrenzt. Keine Haftung besteht für höhere Gewalt, Naturkatastrophen, Pandemien, Streiks oder behördliche Anordnungen. Für vorübergehende Unterbrechungen der Buchungsplattform wird keine Haftung übernommen.\n\n§ 8 Datenschutz\nPersonenbezogene Daten werden ausschließlich zur Buchungsabwicklung und Gästekommunikation verarbeitet. Einzelheiten regelt die Datenschutzerklärung unter /legal/privacy.\n\n§ 9 Anwendbares Recht und Gerichtsstand\nEs gilt spanisches Recht. Gerichtsstand ist Palma de Mallorca. Für Verbraucher innerhalb der EU bleiben zwingende Verbraucherschutzvorschriften ihres Wohnsitzlandes unberührt.\n\n§ 10 Streitbeilegung\nDie Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr/\nDer Betreiber ist weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.\n\n§ 11 Salvatorische Klausel\nSollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.',
    en: '§ 1 Scope\nThese Terms and Conditions apply to all bookings made through portixolholidays.com. Portixol Holidays is a brand of Predator SLU, Carrer Vicari Joaquin Fuster 31, 07006 Palma, Illes Baleares, Spain. The platform facilitates vacation rental bookings in Mallorca.\n\n§ 2 Contract Formation\nAn online booking constitutes a binding offer by the guest. The contract is formed upon receipt of the booking confirmation email. The booking confirmation contains the binding details regarding property, dates, price and guest data.\n\n§ 3 Prices and Payment\nAll prices are in euros and include applicable taxes. The price breakdown comprises: nightly rate, cleaning fee and tourist tax (Impuesto Turístico Sostenible, ITS). A deposit of 30% of the total price is due at booking (processed via Stripe). The remaining balance must be paid no later than 14 days before arrival by bank transfer or on site. In the event of late payment, the operator reserves the right to cancel the booking.\n\n§ 4 Cancellation\nThe cancellation period varies by property and is stated on the respective property detail page. If cancelled within the free cancellation period, the deposit is refunded in full. After the free cancellation period, the deposit is retained. Cancellations must be made in writing (email to hola@portixolholidays.com).\n\n§ 5 Check-in and Check-out\nCheck-in: from 4:00 PM.\nCheck-out: by 10:00 AM.\nLate check-in is possible by prior arrangement. Early check-in and late check-out are subject to availability.\n\n§ 6 Guest Obligations\nThe property must be left in an orderly condition. The guest is liable for any damage caused during the stay. The house rules of the respective property must be observed. The maximum number of guests stated in the booking must not be exceeded. Subletting is not permitted.\n\n§ 7 Liability\nThe operator is liable for intent and gross negligence. Liability for slight negligence is limited to foreseeable, contract-typical damages. No liability exists for force majeure, natural disasters, pandemics, strikes or government orders. No liability is assumed for temporary interruptions of the booking platform.\n\n§ 8 Data Protection\nPersonal data is processed only for booking fulfilment and guest communication. Details are set out in the privacy policy at /legal/privacy.\n\n§ 9 Applicable Law and Jurisdiction\nSpanish law applies. The place of jurisdiction is Palma de Mallorca. For consumers within the EU, the mandatory consumer protection regulations of their country of residence remain unaffected.\n\n§ 10 Dispute Resolution\nThe European Commission provides a platform for online dispute resolution: https://ec.europa.eu/consumers/odr/\nThe operator is neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration body.\n\n§ 11 Severability\nIf any provision of these Terms and Conditions is invalid, the validity of the remaining provisions shall remain unaffected.',
    es: '§ 1 Ámbito de aplicación\nEstas Condiciones Generales se aplican a todas las reservas realizadas a través de portixolholidays.com. Portixol Holidays es una marca de Predator SLU, Carrer Vicari Joaquin Fuster 31, 07006 Palma, Illes Baleares, España. La plataforma facilita reservas de alquiler vacacional en Mallorca.\n\n§ 2 Formalización del contrato\nLa reserva en línea constituye una oferta vinculante por parte del huésped. El contrato se formaliza con la recepción del correo de confirmación de reserva. La confirmación contiene los datos vinculantes sobre el alojamiento, las fechas, el precio y los datos del huésped.\n\n§ 3 Precios y pago\nTodos los precios se expresan en euros e incluyen los impuestos aplicables. El desglose del precio comprende: tarifa por noche, tarifa de limpieza e impuesto turístico sostenible (ITS). Al reservar se abona un depósito del 30 % del precio total (procesado a través de Stripe). El importe restante debe pagarse a más tardar 14 días antes de la llegada mediante transferencia bancaria o en el alojamiento. En caso de impago, el operador se reserva el derecho de cancelar la reserva.\n\n§ 4 Cancelación\nEl plazo de cancelación varía según el alojamiento y se indica en la página de detalle correspondiente. Si se cancela dentro del plazo gratuito, el depósito se reembolsa íntegramente. Transcurrido el plazo gratuito, el depósito se retiene. Las cancelaciones deben realizarse por escrito (correo a hola@portixolholidays.com).\n\n§ 5 Llegada y salida\nCheck-in: a partir de las 16:00 h.\nCheck-out: hasta las 10:00 h.\nEs posible un check-in más tarde con coordinación previa. El check-in anticipado y el check-out tardío están sujetos a disponibilidad.\n\n§ 6 Obligaciones del huésped\nEl alojamiento debe dejarse en condiciones ordenadas. El huésped es responsable de los daños causados durante la estancia. Deben respetarse las normas de la casa del alojamiento correspondiente. No se debe superar el número máximo de huéspedes indicado en la reserva. No se permite el subarrendamiento.\n\n§ 7 Responsabilidad\nEl operador responde por dolo y negligencia grave. La responsabilidad por negligencia leve se limita a los daños previsibles y típicos del contrato. No se asume responsabilidad por fuerza mayor, catástrofes naturales, pandemias, huelgas u órdenes gubernamentales. No se asume responsabilidad por interrupciones temporales de la plataforma de reservas.\n\n§ 8 Protección de datos\nLos datos personales se tratan exclusivamente para la gestión de reservas y la comunicación con el huésped. Los detalles se recogen en la política de privacidad en /legal/privacy.\n\n§ 9 Legislación aplicable y jurisdicción\nSe aplica la legislación española. La jurisdicción competente es Palma de Mallorca. Para los consumidores dentro de la UE, las disposiciones imperativas de protección al consumidor de su país de residencia permanecen vigentes.\n\n§ 10 Resolución de litigios\nLa Comisión Europea ofrece una plataforma de resolución de litigios en línea: https://ec.europa.eu/consumers/odr/\nEl operador no está obligado ni dispuesto a participar en un procedimiento de resolución de litigios ante una junta de arbitraje de consumo.\n\n§ 11 Cláusula de salvaguarda\nSi alguna disposición de estas Condiciones Generales fuera inválida, la validez de las disposiciones restantes no se verá afectada.',
  },
},
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/holidays/data/fallback.ts
git commit -m "feat: add booking terms and conditions for Predator SLU"
```

---

## Task 4: Cookie Banner (WP4)

**Files:**
- Create: `src/components/cookie-banner.tsx`
- Modify: `src/app/[locale]/layout.tsx` (add CookieBanner import and render)
- Modify: `src/messages/en.json`, `src/messages/de.json`, `src/messages/es.json` (add Cookie namespace)

- [ ] **Step 1: Add i18n keys to all 3 locale files**

In `src/messages/en.json`, add before the closing `}`:
```json
,
"Cookie": {
  "notice": "This website uses only technically necessary cookies.",
  "learnMore": "Privacy policy",
  "dismiss": "Understood"
}
```

In `src/messages/de.json`, add before the closing `}`:
```json
,
"Cookie": {
  "notice": "Diese Website verwendet nur technisch notwendige Cookies.",
  "learnMore": "Datenschutz",
  "dismiss": "Verstanden"
}
```

In `src/messages/es.json`, add before the closing `}`:
```json
,
"Cookie": {
  "notice": "Este sitio web utiliza solo cookies técnicamente necesarias.",
  "learnMore": "Privacidad",
  "dismiss": "Entendido"
}
```

- [ ] **Step 2: Create cookie-banner.tsx**

Create `src/components/cookie-banner.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const STORAGE_KEY = 'cookie-notice-dismissed';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations('Cookie');
  const locale = useLocale();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-ink/10 bg-ink px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-foam/85 sm:text-left">
          {t('notice')}{' '}
          <Link
            href={`/${locale}/legal/privacy`}
            className="underline transition hover:text-foam"
          >
            {t('learnMore')}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-sea px-5 py-2 text-sm font-medium text-white transition hover:bg-sea/90"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add CookieBanner to locale layout**

In `src/app/[locale]/layout.tsx`, add the import at the top with the other component imports:
```typescript
import { CookieBanner } from '@/components/cookie-banner';
```

Then add `<CookieBanner />` after `<SiteFooter ... />` and before the closing `</div>`:
```tsx
        <SiteFooter
          locale={locale}
          brandName={settings.brandName}
          supportEmail={settings.supportEmail}
          supportPhone={settings.supportPhone}
          legalLabels={{
            imprint: settings.legalLinks.imprint,
            privacy: settings.legalLinks.privacy,
            terms: settings.legalLinks.terms,
          }}
        />
        <CookieBanner />
      </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (install deps first if needed: `npm install`)
Expected: Clean compile.

- [ ] **Step 5: Commit**

```bash
git add src/components/cookie-banner.tsx src/app/[locale]/layout.tsx src/messages/en.json src/messages/de.json src/messages/es.json
git commit -m "feat: add cookie notice banner with i18n support"
```

---

## Summary

| Task | WP | Description | Files changed |
|------|----|-------------|---------------|
| 1 | 1 | Impressum with Predator SLU data | `fallback.ts` |
| 2 | 2 | Privacy policy (10 sections, 3 languages) | `fallback.ts` |
| 3 | 3 | AGB / booking terms (11 sections, 3 languages) | `fallback.ts` |
| 4 | 4 | Cookie banner component | `cookie-banner.tsx` (new), `layout.tsx`, 3x messages JSON |

**Total commits:** 4
