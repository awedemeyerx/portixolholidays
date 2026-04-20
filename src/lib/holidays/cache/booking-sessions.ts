import type { BookingSessionRecord } from '../types';
import { readCache, writeCache } from './json-store';

const BUCKET = 'booking-sessions';
const STRIPE_INDEX_BUCKET = 'booking-sessions-stripe-index';
const CONFIRMED_TTL_MS = 7 * 24 * 60 * 60 * 1000; // keep confirmed sessions around for a week

function ttlFromSession(session: BookingSessionRecord) {
  if (session.status === 'booking_confirmed' || session.status === 'payment_received') {
    return CONFIRMED_TTL_MS;
  }
  return Math.max(new Date(session.expiresAt).getTime() - Date.now(), 1_000);
}

export async function saveBookingSession(session: BookingSessionRecord) {
  const ttl = ttlFromSession(session);
  await writeCache(BUCKET, session.id, session, ttl);
  if (session.stripeSessionId) {
    await writeCache(STRIPE_INDEX_BUCKET, session.stripeSessionId, session.id, ttl);
  }
}

export async function getBookingSession(id: string) {
  return readCache<BookingSessionRecord>(BUCKET, id);
}

export async function getBookingSessionByStripeId(stripeSessionId: string) {
  const mapped = await readCache<string>(STRIPE_INDEX_BUCKET, stripeSessionId);
  if (!mapped) return null;
  return getBookingSession(mapped);
}

export async function updateBookingSession(
  id: string,
  updater: (session: BookingSessionRecord) => BookingSessionRecord,
) {
  const current = await getBookingSession(id);
  if (!current) return null;
  const next = updater(current);
  await saveBookingSession(next);
  return next;
}
