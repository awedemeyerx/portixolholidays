import { NextResponse } from 'next/server';
import { syncBeds24InventorySnapshots } from '@/lib/holidays/services/inventory-snapshots';

function isAuthorized(request: Request) {
  const secrets = [process.env.BEDS24_SYNC_SECRET?.trim(), process.env.CRON_SECRET?.trim()].filter(Boolean) as string[];
  if (secrets.length === 0) return true;

  const syncSecret = request.headers.get('x-sync-secret')?.trim();
  if (syncSecret && secrets.includes(syncSecret)) return true;

  const authorization = request.headers.get('authorization')?.trim();
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (token && secrets.includes(token)) return true;
  }

  return false;
}

async function runSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body =
    request.method === 'POST'
      ? ((await request.json().catch(() => ({}))) as {
          roomIds?: number[] | string[];
          propertyIds?: number[] | string[];
        })
      : {};

  try {
    const result = await syncBeds24InventorySnapshots({
      roomIds: Array.isArray(body.roomIds) ? body.roomIds.map((value) => Number(value)).filter(Number.isFinite) : undefined,
      propertyIds: Array.isArray(body.propertyIds)
        ? body.propertyIds.map((value) => Number(value)).filter(Number.isFinite)
        : undefined,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Beds24 inventory sync failed.' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}
