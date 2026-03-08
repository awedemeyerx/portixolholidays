import type { BookingSessionRecord } from '../types';
import { readCache, writeCache } from './json-store';

const BUCKET = 'booking-sessions';

function ttlFromSession(session: BookingSessionRecord) {
  return Math.max(new Date(session.expiresAt).getTime() - Date.now(), 1_000);
}

export async function saveBookingSession(session: BookingSessionRecord) {
  await writeCache(BUCKET, session.id, session, ttlFromSession(session));
}

export async function getBookingSession(id: string) {
  return readCache<BookingSessionRecord>(BUCKET, id);
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
