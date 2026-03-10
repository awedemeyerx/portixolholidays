import { NextResponse } from 'next/server';
import { syncBeds24InventorySnapshots } from '@/lib/holidays/services/inventory-snapshots';

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

  await syncBeds24InventorySnapshots({
    roomIds: roomId ? [Number(roomId)] : undefined,
  });

  return NextResponse.json({ received: true });
}
