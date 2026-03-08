import { SearchShell } from '@/components/search/search-shell';
import { localizeSiteSettings, pickLocalized } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { getFaqs, getFeaturedProperties, getSiteSettings } from '@/lib/holidays/services/cms';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = safeLocale(rawLocale);
  const siteSettings = localizeSiteSettings(await getSiteSettings(), locale);
  const featuredProperties = await getFeaturedProperties(locale);
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
