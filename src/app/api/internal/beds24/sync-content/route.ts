import { NextResponse } from 'next/server';
import { syncBeds24PropertyContent } from '@/lib/holidays/services/beds24-content';
import { syncBeds24Locations } from '@/lib/holidays/services/locations';

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

  try {
    const content = await syncBeds24PropertyContent();
    const locations = await syncBeds24Locations();
    return NextResponse.json({ content, locations }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Beds24 content sync failed.' },
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
