import { NextResponse } from 'next/server';
import { deleteCacheByPrefix } from '@/lib/holidays/cache/json-store';

function isAuthorized(request: Request) {
  const configuredSecret = process.env.BEDS24_WEBHOOK_SECRET?.trim();
  if (!configuredSecret) return true;
  return request.headers.get('x-beds24-secret') === configuredSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as { roomId?: string | number };
  const roomId = payload.roomId ? String(payload.roomId) : '';

  if (roomId) {
    await deleteCacheByPrefix('calendar', `room_${roomId}`);
    await deleteCacheByPrefix('offers', `offers_${roomId}`);
  } else {
    await deleteCacheByPrefix('calendar', 'room_');
    await deleteCacheByPrefix('offers', 'offers_');
  }

  return NextResponse.json({ received: true });
}
