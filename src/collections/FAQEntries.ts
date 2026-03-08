import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const FAQEntries: CollectionConfig = {
  slug: 'faq-entries',
  admin: {
    useAsTitle: 'internalName',
    defaultColumns: ['internalName', 'order'],
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    localizedText('question', 'Question'),
    localizedTextarea('answer', 'Answer'),
  ],
};
