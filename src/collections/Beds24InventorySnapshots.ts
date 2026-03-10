import type { CollectionConfig } from 'payload';

export const Beds24InventorySnapshots: CollectionConfig = {
  slug: 'beds24-inventory-snapshots',
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
    {
      name: 'from',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'to',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'beds24',
      options: [
        { label: 'Beds24', value: 'beds24' },
        { label: 'Fallback', value: 'fallback' },
      ],
    },
    {
      name: 'generatedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'days',
      type: 'json',
      required: true,
    },
    {
      name: 'raw',
      type: 'json',
    },
  ],
};
