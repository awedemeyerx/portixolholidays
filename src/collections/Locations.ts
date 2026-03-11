import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'internalName',
    defaultColumns: ['internalName', 'priority'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'internalName',
      type: 'text',
      required: true,
    },
    {
      name: 'priority',
      type: 'number',
      required: true,
      defaultValue: 999,
    },
    localizedText('slugs', 'Locale Slugs'),
    localizedText('title', 'Title'),
    localizedTextarea('summary', 'Summary', false),
    localizedTextarea('description', 'Description', false),
    localizedTextarea('directions', 'Directions', false),
    {
      name: 'heroImageUrl',
      type: 'text',
    },
    {
      name: 'beds24PropertyIds',
      type: 'array',
      fields: [
        {
          name: 'value',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
};
