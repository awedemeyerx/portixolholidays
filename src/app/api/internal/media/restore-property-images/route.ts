import { NextResponse } from 'next/server';
import { restorePropertyImagesFromFallback } from '@/lib/holidays/services/property-image-import';

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
    const body = (await request.json()) as {
      beds24PropertyId?: number;
    };

    if (!body.beds24PropertyId) {
      return NextResponse.json({ error: 'beds24PropertyId is required.' }, { status: 400 });
    }

    const result = await restorePropertyImagesFromFallback(body.beds24PropertyId);
    return NextResponse.json(
      {
        restoredAt: new Date().toISOString(),
        result,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Property image restore failed.' },
      { status: 500 },
    );
  }
}
