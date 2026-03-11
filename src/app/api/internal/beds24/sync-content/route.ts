import { NextResponse } from 'next/server';
import { syncBeds24PropertyContent } from '@/lib/holidays/services/beds24-content';
import { syncBeds24Locations } from '@/lib/holidays/services/locations';

function isAuthorized(request: Request) {
  const configuredSecret = process.env.BEDS24_SYNC_SECRET?.trim();
  if (!configuredSecret) return true;
  return request.headers.get('x-sync-secret') === configuredSecret;
}

export async function POST(request: Request) {
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
