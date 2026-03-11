import { z } from 'zod';
import { LOCALES } from './types';
import { diffNights } from './dates';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const locationArray = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}, z.array(z.string().min(1)).max(12));

export const localeSchema = z.enum(LOCALES);

export const searchQuerySchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1).max(12),
    locale: localeSchema,
    locations: locationArray.optional().default([]),
  })
  .refine((value) => diffNights(value.checkIn, value.checkOut) > 0, {
    message: 'Checkout must be after checkin.',
    path: ['checkOut'],
  });

export const checkoutPayloadSchema = z.object({
  slug: z.string().min(1),
  locale: localeSchema,
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1).max(12),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  notes: z.string().max(1500).optional().or(z.literal('')),
  acceptedTerms: z.literal(true),
  acceptedPrivacy: z.literal(true),
});
