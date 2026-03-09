import { NextResponse } from 'next/server';
import { importPropertyTexts } from '@/lib/holidays/services/property-text-import';
import type { PropertyTextImportItem } from '@/lib/holidays/types';

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
      imports?: PropertyTextImportItem[];
    };
    const imports = Array.isArray(body.imports) ? body.imports : [];

    if (imports.length === 0) {
      return NextResponse.json({ error: 'No property text imports provided.' }, { status: 400 });
    }

    const result = await importPropertyTexts(imports);
    return NextResponse.json(
      {
        importedAt: new Date().toISOString(),
        results: result,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Property text import failed.' },
      { status: 500 },
    );
  }
}
