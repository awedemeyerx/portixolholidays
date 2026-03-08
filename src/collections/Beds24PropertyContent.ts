import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const Beds24PropertyContent: CollectionConfig = {
  slug: 'beds24-property-content',
  admin: {
    useAsTitle: 'internalName',
    defaultColumns: ['internalName', 'beds24PropertyId', 'beds24RoomId', 'lastSyncedAt'],
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
      name: 'beds24PropertyId',
      type: 'number',
      required: true,
      index: true,
    },
    {
      name: 'beds24RoomId',
      type: 'number',
      required: true,
      index: true,
    },
    localizedText('title', 'Title', false),
    localizedTextarea('summary', 'Summary', false),
    localizedTextarea('description', 'Description', false),
    localizedText('locationLabel', 'Location Label', false),
    {
      name: 'heroImageUrl',
      type: 'text',
    },
    {
      name: 'galleryUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'bedrooms',
      type: 'number',
    },
    {
      name: 'bathrooms',
      type: 'number',
    },
    {
      name: 'maxGuests',
      type: 'number',
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'raw',
      type: 'json',
    },
  ],
};
