import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'internalName',
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
      name: 'pageKey',
      type: 'text',
      required: true,
      unique: true,
    },
    localizedText('title', 'Title'),
    localizedTextarea('intro', 'Intro'),
    localizedTextarea('body', 'Body'),
  ],
};
