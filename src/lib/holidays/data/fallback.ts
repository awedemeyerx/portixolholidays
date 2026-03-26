import type { FAQEntry, LegalPageRecord, PropertyRecord, SiteSettingsRecord } from '../types';

export const fallbackSiteSettings: SiteSettingsRecord = {
  brandName: 'Portixol Holidays',
  supportEmail: 'hola@portixolholidays.com',
  supportPhone: '+34 871 180 796',
  whatsapp: '+34 600 000 000',
  depositRate: 0.3,
  heroEyebrow: {
    de: 'Ferienhäuser am Meer',
    en: 'Seaside holiday homes',
    es: 'Casas vacacionales junto al mar',
  },
  heroTitle: {
    de: 'Sichere Mallorca Holidays in außergewöhnlicher Lage buchen.',
    en: 'Book secure Mallorca holidays in exceptional locations.',
    es: 'Reserva vacaciones seguras en Mallorca en ubicaciones excepcionales.',
  },
  heroSubtitle: {
    de: 'Entdecke handverlesene Ferienhäuser in Portixol, El Molinar und Port d’Andratx, prüfe freie Termine sofort und reserviere deinen Traumurlaub auf Mallorca komfortabel online.',
    en: 'Discover handpicked holiday homes in Portixol, El Molinar and Port d\'Andratx, check available dates instantly and reserve your dream Mallorca stay online with confidence.',
    es: 'Descubre casas vacacionales seleccionadas en Portixol, El Molinar y Port d\'Andratx, consulta fechas disponibles al instante y reserva tu estancia ideal en Mallorca con total comodidad.',
  },
  heroPrimaryCta: {
    de: 'Verfügbare Häuser finden',
    en: 'Find available homes',
    es: 'Ver casas disponibles',
  },
  heroSecondaryCta: {
    de: 'Objekte ansehen',
    en: 'Browse properties',
    es: 'Ver alojamientos',
  },
  searchHint: {
    de: 'Wähle Anreise, Abreise und Gästezahl. Darunter erscheinen passende Ferienhäuser für deinen Mallorca-Urlaub.',
    en: 'Choose arrival, departure and guests. Suitable holiday homes for your Mallorca escape appear below.',
    es: 'Elige llegada, salida y huéspedes. Debajo verás alojamientos ideales para tus vacaciones en Mallorca.',
  },
  searchEmptyTitle: {
    de: 'Bitte anderes Zeitfenster wählen',
    en: 'Please choose a different date window',
    es: 'Elige otro rango de fechas',
  },
  searchEmptyBody: {
    de: 'Für diesen Zeitraum ist aktuell nichts frei. Wir schlagen dir direkt alternative Fenster vor.',
    en: 'Nothing is currently available for these dates. We suggest nearby windows immediately.',
    es: 'No hay disponibilidad para estas fechas. Te mostramos alternativas cercanas.',
  },
  faqTitle: {
    de: 'Häufige Fragen',
    en: 'Common questions',
    es: 'Preguntas frecuentes',
  },
  faqIntro: {
    de: 'Alles Wichtige zur Anzahlung, Anreise und Verfügbarkeit.',
    en: 'The essentials about deposits, arrival and live availability.',
    es: 'Lo esencial sobre depósito, llegada y disponibilidad.',
  },
  legalLinks: {
    imprint: { de: 'Impressum', en: 'Imprint', es: 'Aviso legal' },
    privacy: { de: 'Datenschutz', en: 'Privacy', es: 'Privacidad' },
    terms: { de: 'AGB', en: 'Terms', es: 'Condiciones' },
  },
};

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

export const fallbackLegalPages: LegalPageRecord[] = [
  {
    slug: 'imprint',
    title: {
      de: 'Impressum',
      en: 'Imprint',
      es: 'Aviso legal',
    },
    body: {
      de: 'Angaben gemäß § 5 TMG und Art. 10 LSSI-CE\n\nBetreiber\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nSpanien\n\nVertretungsberechtigter Geschäftsführer\nArnd v. Wedemeyer\n\nKontakt\nTelefon: +34 871 180 796\nE-Mail: hola@portixolholidays.com\n\nHandelsregister\nRegistro Mercantil de Palma de Mallorca\nTomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1\n\nUmsatzsteuer-Identifikationsnummer\nCIF: B57963829\nUSt-IdNr.: ESB57963829\n\nVerantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV\nArnd v. Wedemeyer (Anschrift wie oben)\n\nEU-Streitbeilegung\nDie Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/\nWir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      en: 'Legal Notice pursuant to § 5 TMG and Art. 10 LSSI-CE\n\nOperator\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nSpain\n\nManaging Director\nArnd v. Wedemeyer\n\nContact\nPhone: +34 871 180 796\nEmail: hola@portixolholidays.com\n\nCommercial Register\nRegistro Mercantil de Palma de Mallorca\nVolume 2657, Folio 198, Section 8, Sheet PM 78716, Entry 1\n\nTax Identification\nCIF: B57963829\nVAT ID: ESB57963829\n\nResponsible for Content pursuant to § 18(2) MStV\nArnd v. Wedemeyer (address as above)\n\nEU Online Dispute Resolution\nThe European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/\nWe are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration body.',
      es: 'Aviso legal conforme al Art. 10 LSSI-CE\n\nTitular\nPredator SLU\nCarrer Vicari Joaquin Fuster, 31\n07006 Palma, Illes Baleares\nEspaña\n\nAdministrador\nArnd v. Wedemeyer\n\nContacto\nTeléfono: +34 871 180 796\nCorreo electrónico: hola@portixolholidays.com\n\nRegistro Mercantil\nRegistro Mercantil de Palma de Mallorca\nTomo 2657, Folio 198, Sección 8, Hoja PM 78716, Inscripción 1\n\nIdentificación fiscal\nCIF: B57963829\nNIF-IVA: ESB57963829\n\nResponsable del contenido\nArnd v. Wedemeyer (dirección indicada arriba)\n\nResolución de litigios en línea de la UE\nLa Comisión Europea ofrece una plataforma de resolución de litigios en línea (ODR): https://ec.europa.eu/consumers/odr/\nNo estamos obligados ni dispuestos a participar en un procedimiento de resolución de litigios ante una junta de arbitraje de consumo.',
    },
  },
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
  {
    slug: 'terms',
    title: {
      de: 'AGB',
      en: 'Terms',
      es: 'Condiciones',
    },
    body: {
      de: 'Es gelten die jeweils im Buchungsprozess angezeigten Bedingungen des ausgewählten Objekts.',
      en: 'The conditions shown during checkout for the selected property apply.',
      es: 'Se aplican las condiciones mostradas durante la reserva para el alojamiento seleccionado.',
    },
  },
];

export const fallbackProperties: PropertyRecord[] = [
  {
    id: 'casa-luz',
    priority: 1,
    beds24PropertyId: 174132,
    beds24RoomId: 380037,
    slugs: { de: 'casa-luz', en: 'casa-luz', es: 'casa-luz' },
    title: { de: 'Casa Luz', en: 'Casa Luz', es: 'Casa Luz' },
    summary: {
      de: 'Helles Stadthaus mit sonniger Terrasse und kurzem Weg zum Meer.',
      en: 'Bright townhouse with a sunny terrace and a short walk to the sea.',
      es: 'Casa luminosa con terraza soleada y pocos minutos hasta el mar.',
    },
    description: {
      de: 'Casa Luz verbindet mediterrane Ruhe mit einem klaren, modernen Interieur. Ideal für Paare oder kleine Familien, die Portixol zu Fuß erleben wollen.',
      en: 'Casa Luz combines Mediterranean calm with a clean modern interior. Ideal for couples or small families who want to experience Portixol on foot.',
      es: 'Casa Luz combina calma mediterránea con un interior limpio y moderno. Ideal para parejas o familias pequeñas que quieran vivir Portixol a pie.',
    },
    locationLabel: { de: 'Portixol, Palma', en: 'Portixol, Palma', es: 'Portixol, Palma' },
    distanceLabel: {
      de: '5 Gehminuten bis zur Promenade',
      en: '5-minute walk to the promenade',
      es: 'A 5 minutos andando del paseo',
    },
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 4,
    heroImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      { id: 'terrace', label: { de: 'Sonnenterrasse', en: 'Sun terrace', es: 'Terraza soleada' } },
      { id: 'design', label: { de: 'Modernes Interieur', en: 'Modern interior', es: 'Interior moderno' } },
      { id: 'walkable', label: { de: 'Alles fußläufig', en: 'Walk everywhere', es: 'Todo a pie' } },
    ],
    amenities: [
      { id: 'wifi', label: { de: 'High-Speed WLAN', en: 'High-speed Wi-Fi', es: 'Wi-Fi de alta velocidad' } },
      { id: 'kitchen', label: { de: 'Voll ausgestattete Küche', en: 'Fully equipped kitchen', es: 'Cocina equipada' } },
      { id: 'ac', label: { de: 'Klimaanlage', en: 'Air conditioning', es: 'Aire acondicionado' } },
    ],
    houseRules: [
      { id: 'pets', label: { de: 'Keine Haustiere', en: 'No pets', es: 'No se admiten mascotas' } },
      { id: 'smoking', label: { de: 'Nichtraucherhaus', en: 'Non-smoking home', es: 'Alojamiento sin humo' } },
    ],
    pricing: { nightly: 285, cleaningFee: 95, taxes: 28, minStay: 3, depositRate: 0.3, currency: 'EUR' },
    cancellationSummary: {
      de: 'Kostenfreie Stornierung bis 14 Tage vor Anreise, danach gemäß Buchungsbedingungen.',
      en: 'Free cancellation up to 14 days before arrival, after that the booking terms apply.',
      es: 'Cancelación gratuita hasta 14 días antes de la llegada; después se aplican las condiciones de reserva.',
    },
    seoTitle: {
      de: 'Casa Luz in Portixol buchen',
      en: 'Book Casa Luz in Portixol',
      es: 'Reservar Casa Luz en Portixol',
    },
    seoDescription: {
      de: 'Helles Haus in Portixol mit Terrasse, 3 Schlafzimmern und direktem Zugang zur Promenade.',
      en: 'Bright Portixol home with terrace, 3 bedrooms and fast access to the promenade.',
      es: 'Casa luminosa en Portixol con terraza, 3 dormitorios y acceso rápido al paseo.',
    },
    blockedRanges: [
      { from: '2026-04-18', to: '2026-04-24' },
      { from: '2026-06-09', to: '2026-06-14' },
    ],
  },
  {
    id: 'casa-mar',
    priority: 2,
    beds24PropertyId: 174133,
    beds24RoomId: 380038,
    slugs: { de: 'casa-mar', en: 'casa-mar', es: 'casa-mar' },
    title: { de: 'Casa Mar', en: 'Casa Mar', es: 'Casa Mar' },
    summary: {
      de: 'Großzügige Wohnung mit Meerblick für längere Aufenthalte.',
      en: 'Spacious sea-view apartment for longer stays.',
      es: 'Apartamento amplio con vistas al mar para estancias largas.',
    },
    description: {
      de: 'Casa Mar ist auf ruhige Ferienwochen ausgelegt: viel Licht, langer Balkon und Platz für Familien oder zwei Paare.',
      en: 'Casa Mar is designed for calm holiday weeks: lots of light, a long balcony and room for families or two couples.',
      es: 'Casa Mar está pensada para semanas tranquilas: mucha luz, balcón largo y espacio para familias o dos parejas.',
    },
    locationLabel: { de: 'El Molinar', en: 'El Molinar', es: 'El Molinar' },
    distanceLabel: {
      de: 'Direkt an der Meereslinie',
      en: 'Directly on the seafront',
      es: 'Directamente frente al mar',
    },
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 4,
    heroImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80',
    ],
    highlights: [
      { id: 'sea-view', label: { de: 'Meerblick', en: 'Sea view', es: 'Vistas al mar' } },
      { id: 'balcony', label: { de: 'Langer Balkon', en: 'Long balcony', es: 'Balcón largo' } },
      { id: 'family', label: { de: 'Familiengeeignet', en: 'Family-friendly', es: 'Ideal para familias' } },
    ],
    amenities: [
      { id: 'lift', label: { de: 'Aufzug', en: 'Elevator', es: 'Ascensor' } },
      { id: 'kitchen', label: { de: 'Große Küche', en: 'Large kitchen', es: 'Cocina grande' } },
      { id: 'workspace', label: { de: 'Arbeitsplatz', en: 'Workspace', es: 'Espacio de trabajo' } },
    ],
    houseRules: [
      { id: 'quiet', label: { de: 'Ruhezeiten ab 22 Uhr', en: 'Quiet hours from 10pm', es: 'Silencio a partir de las 22h' } },
      { id: 'events', label: { de: 'Keine Partys', en: 'No parties', es: 'No fiestas' } },
    ],
    pricing: { nightly: 330, cleaningFee: 110, taxes: 32, minStay: 4, depositRate: 0.3, currency: 'EUR' },
    cancellationSummary: {
      de: 'Kostenfreie Stornierung bis 21 Tage vor Anreise.',
      en: 'Free cancellation up to 21 days before arrival.',
      es: 'Cancelación gratuita hasta 21 días antes de la llegada.',
    },
    seoTitle: { de: 'Casa Mar in El Molinar', en: 'Casa Mar in El Molinar', es: 'Casa Mar en El Molinar' },
    seoDescription: {
      de: 'Apartment mit Meerblick in El Molinar für bis zu 5 Gäste.',
      en: 'Sea-view apartment in El Molinar for up to 5 guests.',
      es: 'Apartamento con vistas al mar en El Molinar para hasta 5 huéspedes.',
    },
    blockedRanges: [
      { from: '2026-04-03', to: '2026-04-10' },
      { from: '2026-07-01', to: '2026-07-08' },
    ],
  },
  {
    id: 'casa-portixol-playa',
    priority: 3,
    beds24PropertyId: 244683,
    beds24RoomId: 515184,
    slugs: { de: 'casa-portixol-playa', en: 'casa-portixol-playa', es: 'casa-portixol-playa' },
    title: {
      de: 'Casa Portixol Playa',
      en: 'Casa Portixol Playa',
      es: 'Casa Portixol Playa',
    },
    summary: {
      de: 'Strandnahes Haus mit Patio und ruhiger Schlafzone.',
      en: 'Beach-close home with patio and quiet sleeping area.',
      es: 'Casa cerca de la playa con patio y zona de descanso tranquila.',
    },
    description: {
      de: 'Casa Portixol Playa ist die unkomplizierte Wahl für Gäste, die morgens direkt ans Wasser wollen und abends in wenigen Minuten Restaurants erreichen.',
      en: 'Casa Portixol Playa is the uncomplicated choice for guests who want the water first thing in the morning and restaurants within minutes at night.',
      es: 'Casa Portixol Playa es la opción sencilla para quienes quieren el mar por la mañana y restaurantes a pocos minutos por la noche.',
    },
    locationLabel: { de: 'Portixol Playa', en: 'Portixol Playa', es: 'Portixol Playa' },
    distanceLabel: {
      de: '2 Minuten bis zum Strand',
      en: '2 minutes to the beach',
      es: 'A 2 minutos de la playa',
    },
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80',
    ],
    highlights: [
      { id: 'patio', label: { de: 'Privater Patio', en: 'Private patio', es: 'Patio privado' } },
      { id: 'beach', label: { de: 'Strandnah', en: 'Near the beach', es: 'Cerca de la playa' } },
      { id: 'restaurants', label: { de: 'Restaurants in der Nähe', en: 'Restaurants nearby', es: 'Restaurantes cerca' } },
    ],
    amenities: [
      { id: 'washer', label: { de: 'Waschmaschine', en: 'Washer', es: 'Lavadora' } },
      { id: 'wifi', label: { de: 'WLAN', en: 'Wi-Fi', es: 'Wi-Fi' } },
      { id: 'ac', label: { de: 'Klimaanlage', en: 'Air conditioning', es: 'Aire acondicionado' } },
    ],
    houseRules: [
      { id: 'pets', label: { de: 'Haustiere auf Anfrage', en: 'Pets on request', es: 'Mascotas bajo petición' } },
      { id: 'smoking', label: { de: 'Rauchen nur außen', en: 'Smoking only outside', es: 'Fumar solo en el exterior' } },
    ],
    pricing: { nightly: 255, cleaningFee: 90, taxes: 25, minStay: 3, depositRate: 0.3, currency: 'EUR' },
    cancellationSummary: {
      de: 'Bis 14 Tage vor Anreise kostenfrei stornierbar.',
      en: 'Free cancellation up to 14 days before arrival.',
      es: 'Cancelación gratuita hasta 14 días antes de la llegada.',
    },
    seoTitle: {
      de: 'Casa Portixol Playa buchen',
      en: 'Book Casa Portixol Playa',
      es: 'Reservar Casa Portixol Playa',
    },
    seoDescription: {
      de: 'Ferienhaus nahe Strand und Promenade in Portixol.',
      en: 'Holiday home near the beach and promenade in Portixol.',
      es: 'Casa vacacional cerca de la playa y el paseo en Portixol.',
    },
    blockedRanges: [
      { from: '2026-05-15', to: '2026-05-18' },
      { from: '2026-08-11', to: '2026-08-17' },
    ],
  },
  {
    id: 'casa-playa',
    priority: 4,
    beds24PropertyId: 244684,
    beds24RoomId: 515185,
    slugs: { de: 'casa-playa', en: 'casa-playa', es: 'casa-playa' },
    title: { de: 'Casa Playa', en: 'Casa Playa', es: 'Casa Playa' },
    summary: {
      de: 'Entspannter Strandaufenthalt mit offener Küche und Familienlayout.',
      en: 'Relaxed beach stay with open kitchen and family-friendly layout.',
      es: 'Estancia relajada cerca de la playa con cocina abierta y distribución familiar.',
    },
    description: {
      de: 'Casa Playa ist auf lässige Urlaubstage ausgelegt: morgens kurz zum Meer, tagsüber kochen, abends zurück auf die Terrasse.',
      en: 'Casa Playa is designed for relaxed holiday rhythms: quick walk to the sea in the morning, cook during the day, back to the terrace at night.',
      es: 'Casa Playa está pensada para vacaciones tranquilas: mar por la mañana, cocina abierta durante el día y terraza por la noche.',
    },
    locationLabel: { de: 'Can Pere Antoni', en: 'Can Pere Antoni', es: 'Can Pere Antoni' },
    distanceLabel: {
      de: '10 Minuten bis Palma Altstadt',
      en: '10 minutes to Palma old town',
      es: 'A 10 minutos del casco antiguo de Palma',
    },
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    heroImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      { id: 'family', label: { de: 'Für 6 Gäste', en: 'For 6 guests', es: 'Para 6 huéspedes' } },
      { id: 'terrace', label: { de: 'Große Terrasse', en: 'Large terrace', es: 'Terraza grande' } },
      { id: 'city', label: { de: 'Stadtnah', en: 'Close to the city', es: 'Cerca de la ciudad' } },
    ],
    amenities: [
      { id: 'parking', label: { de: 'Parkplatz nach Verfügbarkeit', en: 'Parking subject to availability', es: 'Parking sujeto a disponibilidad' } },
      { id: 'dishwasher', label: { de: 'Spülmaschine', en: 'Dishwasher', es: 'Lavavajillas' } },
      { id: 'crib', label: { de: 'Babybett auf Anfrage', en: 'Crib on request', es: 'Cuna bajo petición' } },
    ],
    houseRules: [
      { id: 'events', label: { de: 'Keine Events', en: 'No events', es: 'No eventos' } },
      { id: 'respect', label: { de: 'Rücksicht auf Nachbarn', en: 'Respect the neighbours', es: 'Respeto por los vecinos' } },
    ],
    pricing: { nightly: 360, cleaningFee: 130, taxes: 38, minStay: 4, depositRate: 0.3, currency: 'EUR' },
    cancellationSummary: {
      de: 'Kostenfreie Stornierung bis 21 Tage vor Anreise.',
      en: 'Free cancellation up to 21 days before arrival.',
      es: 'Cancelación gratuita hasta 21 días antes de la llegada.',
    },
    seoTitle: { de: 'Casa Playa in Palma', en: 'Casa Playa in Palma', es: 'Casa Playa en Palma' },
    seoDescription: {
      de: 'Familienfreundliches Haus nahe Strand und Altstadt.',
      en: 'Family-friendly home near the beach and old town.',
      es: 'Casa familiar cerca de la playa y del casco antiguo.',
    },
    blockedRanges: [{ from: '2026-06-22', to: '2026-06-29' }],
  },
  {
    id: 'casa-puerto',
    priority: 5,
    beds24PropertyId: 266085,
    beds24RoomId: 557738,
    slugs: { de: 'casa-puerto', en: 'casa-puerto', es: 'casa-puerto' },
    title: { de: 'Casa Puerto', en: 'Casa Puerto', es: 'Casa Puerto' },
    summary: {
      de: 'Kompakter Hideaway-Spot mit Blick auf Hafen und Dächer.',
      en: 'Compact hideaway with views over the harbour and rooftops.',
      es: 'Refugio compacto con vistas al puerto y a los tejados.',
    },
    description: {
      de: 'Casa Puerto ist die ruhigste Option im Portfolio: kompakt, hoch gelegen und perfekt für zwei Personen.',
      en: 'Casa Puerto is the quietest option in the portfolio: compact, elevated and perfect for two people.',
      es: 'Casa Puerto es la opción más tranquila del portfolio: compacta, elevada y perfecta para dos personas.',
    },
    locationLabel: { de: 'Port de Palma', en: 'Port de Palma', es: 'Port de Palma' },
    distanceLabel: {
      de: 'Ruhige Seitenstraße am Hafen',
      en: 'Quiet side street by the harbour',
      es: 'Calle tranquila junto al puerto',
    },
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    heroImage: 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80',
    ],
    highlights: [
      { id: 'rooftop', label: { de: 'Blick über die Dächer', en: 'Rooftop views', es: 'Vistas sobre los tejados' } },
      { id: 'quiet', label: { de: 'Sehr ruhig', en: 'Very quiet', es: 'Muy tranquilo' } },
      { id: 'couples', label: { de: 'Perfekt für zwei', en: 'Perfect for two', es: 'Perfecto para dos' } },
    ],
    amenities: [
      { id: 'espresso', label: { de: 'Espressomaschine', en: 'Espresso machine', es: 'Cafetera espresso' } },
      { id: 'wifi', label: { de: 'WLAN', en: 'Wi-Fi', es: 'Wi-Fi' } },
      { id: 'ac', label: { de: 'Klimaanlage', en: 'Air conditioning', es: 'Aire acondicionado' } },
    ],
    houseRules: [
      { id: 'children', label: { de: 'Nicht für Kleinkinder geeignet', en: 'Not suited for toddlers', es: 'No apto para niños pequeños' } },
      { id: 'pets', label: { de: 'Keine Haustiere', en: 'No pets', es: 'No mascotas' } },
    ],
    pricing: { nightly: 205, cleaningFee: 75, taxes: 18, minStay: 3, depositRate: 0.3, currency: 'EUR' },
    cancellationSummary: {
      de: 'Bis 10 Tage vor Anreise kostenfrei stornierbar.',
      en: 'Free cancellation up to 10 days before arrival.',
      es: 'Cancelación gratuita hasta 10 días antes de la llegada.',
    },
    seoTitle: { de: 'Casa Puerto in Palma', en: 'Casa Puerto in Palma', es: 'Casa Puerto en Palma' },
    seoDescription: {
      de: 'Ruhiges Ferienhaus für zwei am Hafen von Palma.',
      en: 'Quiet holiday home for two by Palma harbour.',
      es: 'Casa tranquila para dos junto al puerto de Palma.',
    },
    blockedRanges: [
      { from: '2026-04-27', to: '2026-05-02' },
      { from: '2026-07-15', to: '2026-07-20' },
    ],
  },
];
