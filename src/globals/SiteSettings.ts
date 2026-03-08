import type { GlobalConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      defaultValue: 'Portixol Holidays',
    },
    {
      name: 'supportEmail',
      type: 'email',
    },
    {
      name: 'supportPhone',
      type: 'text',
    },
    {
      name: 'whatsapp',
      type: 'text',
    },
    {
      name: 'depositRate',
      type: 'number',
      defaultValue: 0.3,
    },
    localizedText('heroEyebrow', 'Hero Eyebrow'),
    localizedTextarea('heroTitle', 'Hero Title'),
    localizedTextarea('heroSubtitle', 'Hero Subtitle'),
    localizedText('heroPrimaryCta', 'Hero Primary CTA'),
    localizedText('heroSecondaryCta', 'Hero Secondary CTA'),
    localizedTextarea('searchHint', 'Search Hint'),
    localizedText('searchEmptyTitle', 'Empty Title'),
    localizedTextarea('searchEmptyBody', 'Empty Body'),
    localizedText('faqTitle', 'FAQ Title'),
    localizedTextarea('faqIntro', 'FAQ Intro'),
  ],
};
