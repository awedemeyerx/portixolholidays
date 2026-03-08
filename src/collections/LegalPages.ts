import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    useAsTitle: 'slug',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      options: [
        { label: 'Imprint', value: 'imprint' },
        { label: 'Privacy', value: 'privacy' },
        { label: 'Terms', value: 'terms' },
      ],
      unique: true,
    },
    localizedText('title', 'Title'),
    localizedTextarea('body', 'Body'),
  ],
};
