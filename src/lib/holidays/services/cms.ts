import { fallbackFaqs, fallbackLegalPages, fallbackProperties, fallbackSiteSettings } from '../data/fallback';
import { pickLocalized } from '../localize';
import type { FAQEntry, LegalPageRecord, Locale, PropertyRecord, SiteSettingsRecord } from '../types';
import { getPayloadClient } from '@/lib/payload';

function mapLocalizedGroup(group: Record<string, unknown> | undefined, fieldName: string) {
  return {
    de: String(group?.[`${fieldName}DE`] ?? ''),
    en: String(group?.[`${fieldName}EN`] ?? ''),
    es: String(group?.[`${fieldName}ES`] ?? ''),
  };
}

function mapLocalizedGroupWithFallback(
  group: Record<string, unknown> | undefined,
  fieldName: string,
  fallback: SiteSettingsRecord[Exclude<keyof SiteSettingsRecord, 'brandName' | 'supportEmail' | 'supportPhone' | 'whatsapp' | 'depositRate' | 'legalLinks'>],
) {
  const mapped = mapLocalizedGroup(group, fieldName);
  return {
    de: mapped.de || fallback.de,
    en: mapped.en || fallback.en,
    es: mapped.es || fallback.es,
  };
}

function mediaUrl(value: unknown): string {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.url === 'string') return record.url;
    if (typeof record.thumbnailURL === 'string') return record.thumbnailURL;
  }
  return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';
}

function mapProperty(doc: Record<string, unknown>): PropertyRecord {
  const slugs = mapLocalizedGroup(doc.slugs as Record<string, unknown>, 'slugs');
  const title = mapLocalizedGroup(doc.title as Record<string, unknown>, 'title');
  const summary = mapLocalizedGroup(doc.summary as Record<string, unknown>, 'summary');
  const description = mapLocalizedGroup(doc.description as Record<string, unknown>, 'description');
  const locationLabel = mapLocalizedGroup(doc.locationLabel as Record<string, unknown>, 'locationLabel');
  const distanceLabel = mapLocalizedGroup(doc.distanceLabel as Record<string, unknown>, 'distanceLabel');
  const cancellationSummary = mapLocalizedGroup(
    doc.cancellationSummary as Record<string, unknown>,
    'cancellationSummary',
  );
  const seoTitle = mapLocalizedGroup(doc.seoTitle as Record<string, unknown>, 'seoTitle');
  const seoDescription = mapLocalizedGroup(doc.seoDescription as Record<string, unknown>, 'seoDescription');

  const highlights = Array.isArray(doc.highlights)
    ? doc.highlights.map((item, index) => ({
        id: `highlight-${index + 1}`,
        label: mapLocalizedGroup((item as Record<string, unknown>).label as Record<string, unknown>, 'label'),
      }))
    : [];

  const amenities = Array.isArray(doc.amenities)
    ? doc.amenities.map((item, index) => ({
        id: `amenity-${index + 1}`,
        label: mapLocalizedGroup((item as Record<string, unknown>).label as Record<string, unknown>, 'label'),
      }))
    : [];

  const houseRules = Array.isArray(doc.houseRules)
    ? doc.houseRules.map((item, index) => ({
        id: `rule-${index + 1}`,
        label: mapLocalizedGroup((item as Record<string, unknown>).label as Record<string, unknown>, 'label'),
      }))
    : [];

  const gallery = Array.isArray(doc.gallery)
    ? doc.gallery.map((item) => mediaUrl((item as Record<string, unknown>).image ?? item))
    : [];

  const blockedRanges = Array.isArray(doc.blockedRanges)
    ? doc.blockedRanges.map((item) => ({
        from: String((item as Record<string, unknown>).from ?? ''),
        to: String((item as Record<string, unknown>).to ?? ''),
      }))
    : [];

  const pricing = doc.pricing as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    priority: Number(doc.priority ?? 999),
    beds24PropertyId: Number(doc.beds24PropertyId ?? 0),
    beds24RoomId: Number(doc.beds24RoomId ?? 0),
    slugs,
    title,
    summary,
    description,
    locationLabel,
    distanceLabel,
    bedrooms: Number(doc.bedrooms ?? 1),
    bathrooms: Number(doc.bathrooms ?? 1),
    maxGuests: Number(doc.maxGuests ?? 2),
    heroImage: mediaUrl(doc.heroImage),
    gallery,
    highlights,
    amenities,
    houseRules,
    pricing: {
      nightly: Number(pricing?.nightly ?? 220),
      cleaningFee: Number(pricing?.cleaningFee ?? 80),
      taxes: Number(pricing?.taxes ?? 20),
      minStay: Number(pricing?.minStay ?? 3),
      depositRate: Number(pricing?.depositRate ?? 0.3),
      currency: 'EUR',
    },
    cancellationSummary,
    seoTitle,
    seoDescription,
    blockedRanges,
  };
}

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  const payload = await getPayloadClient();
  if (!payload) return fallbackSiteSettings;

  try {
    const global = (await payload.findGlobal({ slug: 'site-settings' })) as Record<string, unknown>;
    return {
      ...fallbackSiteSettings,
      brandName: String(global.brandName ?? fallbackSiteSettings.brandName),
      supportEmail: String(global.supportEmail ?? fallbackSiteSettings.supportEmail),
      supportPhone: String(global.supportPhone ?? fallbackSiteSettings.supportPhone),
      whatsapp: String(global.whatsapp ?? fallbackSiteSettings.whatsapp),
      depositRate: Number(global.depositRate ?? fallbackSiteSettings.depositRate),
      heroEyebrow: mapLocalizedGroupWithFallback(
        global.heroEyebrow as Record<string, unknown>,
        'heroEyebrow',
        fallbackSiteSettings.heroEyebrow,
      ),
      heroTitle: mapLocalizedGroupWithFallback(
        global.heroTitle as Record<string, unknown>,
        'heroTitle',
        fallbackSiteSettings.heroTitle,
      ),
      heroSubtitle: mapLocalizedGroupWithFallback(
        global.heroSubtitle as Record<string, unknown>,
        'heroSubtitle',
        fallbackSiteSettings.heroSubtitle,
      ),
      heroPrimaryCta: mapLocalizedGroupWithFallback(
        global.heroPrimaryCta as Record<string, unknown>,
        'heroPrimaryCta',
        fallbackSiteSettings.heroPrimaryCta,
      ),
      heroSecondaryCta: mapLocalizedGroupWithFallback(
        global.heroSecondaryCta as Record<string, unknown>,
        'heroSecondaryCta',
        fallbackSiteSettings.heroSecondaryCta,
      ),
      searchHint: mapLocalizedGroupWithFallback(
        global.searchHint as Record<string, unknown>,
        'searchHint',
        fallbackSiteSettings.searchHint,
      ),
      searchEmptyTitle: mapLocalizedGroupWithFallback(
        global.searchEmptyTitle as Record<string, unknown>,
        'searchEmptyTitle',
        fallbackSiteSettings.searchEmptyTitle,
      ),
      searchEmptyBody: mapLocalizedGroupWithFallback(
        global.searchEmptyBody as Record<string, unknown>,
        'searchEmptyBody',
        fallbackSiteSettings.searchEmptyBody,
      ),
      faqTitle: mapLocalizedGroupWithFallback(
        global.faqTitle as Record<string, unknown>,
        'faqTitle',
        fallbackSiteSettings.faqTitle,
      ),
      faqIntro: mapLocalizedGroupWithFallback(
        global.faqIntro as Record<string, unknown>,
        'faqIntro',
        fallbackSiteSettings.faqIntro,
      ),
    };
  } catch {
    return fallbackSiteSettings;
  }
}

export async function getProperties(): Promise<PropertyRecord[]> {
  const payload = await getPayloadClient();
  if (!payload) return fallbackProperties;

  try {
    const result = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: 100,
      sort: 'priority',
    });
    return result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>));
  } catch {
    return fallbackProperties;
  }
}

export async function getPropertyBySlug(slug: string, locale: Locale) {
  const properties = await getProperties();
  return properties.find((property) => property.slugs[locale] === slug) ?? null;
}

export async function getFaqs(): Promise<FAQEntry[]> {
  const payload = await getPayloadClient();
  if (!payload) return fallbackFaqs.sort((a, b) => a.order - b.order);

  try {
    const result = await payload.find({
      collection: 'faq-entries',
      limit: 100,
      sort: 'order',
    });
    return result.docs.map((doc, index) => ({
      id: String((doc as Record<string, unknown>).id ?? index),
      order: Number((doc as Record<string, unknown>).order ?? index),
      question: mapLocalizedGroup((doc as Record<string, unknown>).question as Record<string, unknown>, 'question'),
      answer: mapLocalizedGroup((doc as Record<string, unknown>).answer as Record<string, unknown>, 'answer'),
    }));
  } catch {
    return fallbackFaqs.sort((a, b) => a.order - b.order);
  }
}

export async function getLegalPages(): Promise<LegalPageRecord[]> {
  const payload = await getPayloadClient();
  if (!payload) return fallbackLegalPages;

  try {
    const result = await payload.find({
      collection: 'legal-pages',
      limit: 100,
    });
    return result.docs.map((doc) => ({
      slug: String((doc as Record<string, unknown>).slug ?? 'imprint') as LegalPageRecord['slug'],
      title: mapLocalizedGroup((doc as Record<string, unknown>).title as Record<string, unknown>, 'title'),
      body: mapLocalizedGroup((doc as Record<string, unknown>).body as Record<string, unknown>, 'body'),
    }));
  } catch {
    return fallbackLegalPages;
  }
}

export async function getLegalPage(slug: LegalPageRecord['slug']) {
  const pages = await getLegalPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getFeaturedProperties(locale: Locale) {
  const properties = await getProperties();
  return properties.slice(0, 3).map((property) => ({
    id: property.id,
    slug: property.slugs[locale],
    title: pickLocalized(property.title, locale),
    summary: pickLocalized(property.summary, locale),
    heroImage: property.heroImage,
    locationLabel: pickLocalized(property.locationLabel, locale),
    maxGuests: property.maxGuests,
  }));
}
