import { NextResponse } from 'next/server';
import { fetchBeds24PropertyCatalog, isBeds24Configured } from '@/lib/holidays/beds24/client';

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

function findDepositHints(value: unknown, path: string[] = [], hits: Array<{ path: string; value: unknown }> = []) {
  if (hits.length > 50) return hits;

  if (Array.isArray(value)) {
    value.forEach((entry, index) => findDepositHints(entry, [...path, String(index)], hits));
    return hits;
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const keyLower = key.toLowerCase();
      if (
        keyLower.includes('deposit') ||
        keyLower.includes('payment') ||
        keyLower.includes('prepay') ||
        keyLower.includes('percent')
      ) {
        hits.push({ path: [...path, key].join('.'), value: nested });
      }
      findDepositHints(nested, [...path, key], hits);
    }
  }

  return hits;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!isBeds24Configured()) {
    return NextResponse.json({ error: 'Beds24 not configured.' }, { status: 400 });
  }

  const url = new URL(request.url);
  const idParam = url.searchParams.get('propertyId');
  const propertyIds = idParam
    ? idParam
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0)
    : undefined;

  try {
    const catalog = await fetchBeds24PropertyCatalog({
      ids: propertyIds,
      includeAllRooms: true,
      includeTexts: ['all'],
      includeOffers: true,
      includePriceRules: true,
    });

    const hints = findDepositHints(catalog);
    return NextResponse.json(
      {
        depositHints: hints,
        raw: catalog,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Beds24 property debug failed.' },
      { status: 500 },
    );
  }
}
