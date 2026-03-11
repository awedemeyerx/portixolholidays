import type { CollectionConfig } from 'payload';

export const Beds24OfferCache: CollectionConfig = {
  slug: 'beds24-offer-cache',
  admin: {
    useAsTitle: 'cacheKey',
    defaultColumns: ['cacheKey', 'beds24RoomId', 'checkIn', 'checkOut', 'guests', 'expiresAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'cacheKey', type: 'text', required: true, index: true },
    { name: 'beds24PropertyId', type: 'number', required: true, index: true },
    { name: 'beds24RoomId', type: 'number', required: true, index: true },
    { name: 'checkIn', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'checkOut', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'guests', type: 'number', required: true },
    { name: 'available', type: 'checkbox', required: true, defaultValue: false },
    { name: 'totalPrice', type: 'number', required: true, defaultValue: 0 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'EUR' },
    { name: 'lastSyncedAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'expiresAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'raw', type: 'json' },
  ],
};
