import { notFound } from 'next/navigation';
import { localizeLegalPage } from '@/lib/holidays/localize';
import { safeLocale } from '@/lib/holidays/locale';
import { getLegalPage } from '@/lib/holidays/services/cms';

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: 'imprint' | 'privacy' | 'terms' }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = safeLocale(rawLocale);
  const page = await getLegalPage(slug);
  if (!page) notFound();
  const localized = localizeLegalPage(page, locale);

  return (
    <div className="px-4 pb-12 pt-4 md:px-8">
      <article className="glass-card mx-auto max-w-4xl rounded-[2rem] px-6 py-8 md:px-10">
        <p className="label-caps text-xs text-sea">{localized.slug}</p>
        <h1 className="mt-3 font-serif text-5xl">{localized.title}</h1>
        <div className="mt-6 whitespace-pre-line text-sm leading-8 text-ink/72">{localized.body}</div>
      </article>
    </div>
  );
}
