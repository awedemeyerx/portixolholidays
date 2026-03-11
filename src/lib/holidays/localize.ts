import type { Highlight, LegalPageRecord, Localized, Locale, LocationRecord, PropertyRecord, SiteSettingsRecord } from './types';

export function pickLocalized<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

export function mapHighlights(items: Highlight[], locale: Locale): string[] {
  return items.map((item) => pickLocalized(item.label, locale));
}

export function localizeSiteSettings(settings: SiteSettingsRecord, locale: Locale) {
  return {
    brandName: settings.brandName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    whatsapp: settings.whatsapp,
    depositRate: settings.depositRate,
    heroEyebrow: pickLocalized(settings.heroEyebrow, locale),
    heroTitle: pickLocalized(settings.heroTitle, locale),
    heroSubtitle: pickLocalized(settings.heroSubtitle, locale),
    heroPrimaryCta: pickLocalized(settings.heroPrimaryCta, locale),
    heroSecondaryCta: pickLocalized(settings.heroSecondaryCta, locale),
    searchHint: pickLocalized(settings.searchHint, locale),
    searchEmptyTitle: pickLocalized(settings.searchEmptyTitle, locale),
    searchEmptyBody: pickLocalized(settings.searchEmptyBody, locale),
    faqTitle: pickLocalized(settings.faqTitle, locale),
    faqIntro: pickLocalized(settings.faqIntro, locale),
    legalLinks: {
      imprint: pickLocalized(settings.legalLinks.imprint, locale),
      privacy: pickLocalized(settings.legalLinks.privacy, locale),
      terms: pickLocalized(settings.legalLinks.terms, locale),
    },
  };
}

export function localizeProperty(property: PropertyRecord, locale: Locale) {
  return {
    slug: property.slugs[locale],
    title: property.title[locale],
    summary: property.summary[locale],
    description: property.description[locale],
    locationLabel: property.locationLabel[locale],
    distanceLabel: property.distanceLabel[locale],
    highlights: mapHighlights(property.highlights, locale),
    amenities: mapHighlights(property.amenities, locale),
    houseRules: mapHighlights(property.houseRules, locale),
    cancellationSummary: property.cancellationSummary[locale],
    seoTitle: property.seoTitle[locale],
    seoDescription: property.seoDescription[locale],
  };
}

export function localizeLocation(location: LocationRecord, locale: Locale) {
  return {
    slug: location.slugs[locale],
    title: location.title[locale],
    summary: location.summary[locale],
    description: location.description[locale],
    directions: location.directions[locale],
  };
}

export function localizeLegalPage(page: LegalPageRecord, locale: Locale) {
  return {
    slug: page.slug,
    title: page.title[locale],
    body: page.body[locale],
  };
}
