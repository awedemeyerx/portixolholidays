import type { FAQEntry, LegalPageRecord, PropertyRecord, SiteSettingsRecord } from '../types';

export const fallbackSiteSettings: SiteSettingsRecord = {
  brandName: 'Portixol Holidays',
  supportEmail: 'hola@portixolholidays.com',
  supportPhone: '+34 971 000 000',
  whatsapp: '+34 600 000 000',
  depositRate: 0.3,
  heroEyebrow: {
    de: 'Ferienhäuser am Meer',
    en: 'Seaside holiday homes',
    es: 'Casas vacacionales junto al mar',
  },
  heroTitle: {
    de: 'Mallorca-Aufenthalte, die sich klar und leicht buchen lassen.',
    en: 'Mallorca stays with a booking flow that finally feels clear.',
    es: 'Estancias en Mallorca con una reserva clara y rápida.',
  },
  heroSubtitle: {
    de: 'Wähle deinen Zeitraum, sieh sofort freie Häuser und buche direkt mit eigener Buchungsmaschine statt Beds24-Widgets.',
    en: 'Pick your dates, see available homes instantly and book through a custom journey instead of Beds24 widgets.',
    es: 'Elige tus fechas, ve las casas disponibles al instante y reserva con un flujo propio en lugar de widgets de Beds24.',
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
    de: 'Anreise, Abreise und Gäste wählen. Darunter erscheinen nur wirklich freie Objekte.',
    en: 'Choose arrival, departure and guests. Only actually available homes appear below.',
    es: 'Elige llegada, salida y huéspedes. Debajo solo aparecen alojamientos realmente disponibles.',
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
      de: 'In Version 1 beträgt die Online-Anzahlung 30 Prozent des Aufenthaltspreises. Der Rest wird später separat abgerechnet.',
      en: 'In version 1 the online deposit is 30 percent of the stay total. The remaining balance is charged later.',
      es: 'En la versión 1 el depósito online es del 30 por ciento del total de la estancia. El resto se cobra más tarde.',
    },
  },
  {
    id: 'faq-live',
    order: 2,
    question: {
      de: 'Sind Preise und Verfügbarkeiten live?',
      en: 'Are prices and availability live?',
      es: '¿Los precios y la disponibilidad son en tiempo real?',
    },
    answer: {
      de: 'Die Website arbeitet mit einem schnellen JSON-Cache. Vor dem finalen Checkout werden Preis und Verfügbarkeit serverseitig nochmals direkt bei Beds24 geprüft.',
      en: 'The website uses a fast JSON cache. Before final checkout, price and availability are rechecked server-side against Beds24.',
      es: 'La web usa una caché JSON rápida. Antes del checkout final, precio y disponibilidad se validan otra vez contra Beds24 desde el servidor.',
    },
  },
  {
    id: 'faq-checkin',
    order: 3,
    question: {
      de: 'Kann ich spät einchecken?',
      en: 'Can I check in late?',
      es: '¿Puedo hacer check-in tarde?',
    },
    answer: {
      de: 'Ja, nach Abstimmung. Die genauen Check-in-Informationen erhältst du nach der Buchung per E-Mail.',
      en: 'Yes, by arrangement. Exact check-in details are sent by email after booking.',
      es: 'Sí, con coordinación previa. Los detalles exactos de check-in se envían por correo tras la reserva.',
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
      de: 'Portixol Holidays\nPalma de Mallorca\nKontakt: hola@portixolholidays.com',
      en: 'Portixol Holidays\nPalma de Mallorca\nContact: hola@portixolholidays.com',
      es: 'Portixol Holidays\nPalma de Mallorca\nContacto: hola@portixolholidays.com',
    },
  },
  {
    slug: 'privacy',
    title: {
      de: 'Datenschutz',
      en: 'Privacy',
      es: 'Privacidad',
    },
    body: {
      de: 'Personenbezogene Daten werden ausschließlich für Suche, Buchung und Gästekommunikation verarbeitet.',
      en: 'Personal data is processed only for search, booking and guest communication.',
      es: 'Los datos personales se tratan solo para búsqueda, reserva y comunicación con el huésped.',
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
    beds24PropertyId: 89711,
    beds24RoomId: 8971101,
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
    bedrooms: 2,
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
      de: 'Helles Haus in Portixol mit Terrasse, 2 Schlafzimmern und direktem Zugang zur Promenade.',
      en: 'Bright Portixol home with terrace, 2 bedrooms and fast access to the promenade.',
      es: 'Casa luminosa en Portixol con terraza, 2 dormitorios y acceso rápido al paseo.',
    },
    blockedRanges: [
      { from: '2026-04-18', to: '2026-04-24' },
      { from: '2026-06-09', to: '2026-06-14' },
    ],
  },
  {
    id: 'casa-mar',
    priority: 2,
    beds24PropertyId: 89712,
    beds24RoomId: 8971201,
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
    maxGuests: 5,
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
    beds24PropertyId: 89713,
    beds24RoomId: 8971301,
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
    beds24PropertyId: 89714,
    beds24RoomId: 8971401,
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
    beds24PropertyId: 89715,
    beds24RoomId: 8971501,
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
