import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/holidays/seo';
import { LOCALES } from '@/lib/holidays/types';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/locations', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/legal/imprint', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  return LOCALES.flatMap((locale) =>
    staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );
}
