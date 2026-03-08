import type { CollectionConfig } from 'payload';
import { localizedText, localizedTextarea } from '@/lib/holidays/payload-fields';

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'internalName',
    defaultColumns: ['internalName', 'priority', 'beds24PropertyId', 'beds24RoomId'],
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
      defaultValue: 999,
      required: true,
    },
    {
      name: 'beds24PropertyId',
      type: 'number',
      required: true,
    },
    {
      name: 'beds24RoomId',
      type: 'number',
      required: true,
    },
    localizedText('slugs', 'Locale Slugs'),
    localizedText('title', 'Title'),
    localizedTextarea('summary', 'Summary'),
    localizedTextarea('description', 'Description'),
    localizedText('locationLabel', 'Location Label'),
    localizedText('distanceLabel', 'Distance Label'),
    {
      name: 'bedrooms',
      type: 'number',
      required: true,
    },
    {
      name: 'bathrooms',
      type: 'number',
      required: true,
    },
    {
      name: 'maxGuests',
      type: 'number',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [localizedText('label', 'Label')],
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [localizedText('label', 'Label')],
    },
    {
      name: 'houseRules',
      type: 'array',
      fields: [localizedText('label', 'Label')],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        { name: 'nightly', type: 'number', required: true },
        { name: 'cleaningFee', type: 'number', required: true },
        { name: 'taxes', type: 'number', required: true },
        { name: 'minStay', type: 'number', required: true },
        { name: 'depositRate', type: 'number', required: true, defaultValue: 0.3 },
      ],
    },
    localizedTextarea('cancellationSummary', 'Cancellation Summary'),
    localizedText('seoTitle', 'SEO Title'),
    localizedTextarea('seoDescription', 'SEO Description'),
    {
      name: 'blockedRanges',
      type: 'array',
      fields: [
        { name: 'from', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'to', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
  ],
};
