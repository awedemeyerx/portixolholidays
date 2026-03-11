import { SearchShell } from '@/components/search/search-shell';
import { localizeSiteSettings, pickLocalized } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { searchProperties, getSearchCalendarSnapshots } from '@/lib/holidays/services/search';
import { getFaqs, getFeaturedLocations, getFeaturedProperties, getLocationOptions, getSiteSettings } from '@/lib/holidays/services/cms';
import { searchQuerySchema } from '@/lib/holidays/validation';

export default async function LocaleHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale: rawLocale }, rawSearchParams] = await Promise.all([params, searchParams]);
  const locale = safeLocale(rawLocale);
  const siteSettings = localizeSiteSettings(await getSiteSettings(), locale);
  const selectedLocations = [rawSearchParams.location]
    .flat()
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const selectedGuests = typeof rawSearchParams.guests === 'string' ? Number(rawSearchParams.guests) : 2;
  const guests = Number.isFinite(selectedGuests) && selectedGuests > 0 ? selectedGuests : 2;
  const parsedSearch = searchQuerySchema.safeParse({
    locale,
    checkIn: rawSearchParams.checkIn,
    checkOut: rawSearchParams.checkOut,
    guests: rawSearchParams.guests,
    locations: selectedLocations,
  });
  const hasSearchQuery = parsedSearch.success;
  const [featuredProperties, featuredLocations, locationOptions, searchCalendars] = await Promise.all([
    hasSearchQuery ? Promise.resolve([]) : getFeaturedProperties(locale),
    hasSearchQuery ? Promise.resolve([]) : getFeaturedLocations(locale),
    getLocationOptions(locale),
    getSearchCalendarSnapshots({ locations: selectedLocations, guests }),
  ]);
  let initialResponse = null;
  let initialError: string | null = null;

  if (hasSearchQuery) {
    try {
      initialResponse = await searchProperties(parsedSearch.data);
    } catch (error) {
      initialError = error instanceof Error ? error.message : 'Search failed';
    }
  }
  const faqs = await getFaqs();

  return (
    <>
      <SearchShell
        locale={locale}
        hero={{
          eyebrow: siteSettings.heroEyebrow,
          title: siteSettings.heroTitle,
          subtitle: siteSettings.heroSubtitle,
          ctaPrimary: siteSettings.heroPrimaryCta,
          hint: siteSettings.searchHint,
          emptyTitle: siteSettings.searchEmptyTitle,
          emptyBody: siteSettings.searchEmptyBody,
        }}
        featuredProperties={featuredProperties}
        featuredLocations={featuredLocations}
        locationOptions={locationOptions}
        searchCalendars={searchCalendars}
        initialResponse={initialResponse}
        initialError={initialError}
      />

      <section id="faq" className="px-4 pb-8 pt-8 md:px-8">
        <div className="glass-card mx-auto max-w-7xl rounded-[2rem] px-6 py-8 md:px-8">
          <p className="label-caps text-xs text-sea">{siteSettings.faqTitle}</p>
          <h2 className="mt-3 font-serif text-4xl">{siteSettings.faqIntro}</h2>
          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.id} className="rounded-[1.5rem] bg-white/70 px-5 py-4">
                <summary className="cursor-pointer list-none text-lg font-medium">
                  {pickLocalized(faq.question, locale)}
                </summary>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-ink/72">
                  {pickLocalized(faq.answer, locale)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
