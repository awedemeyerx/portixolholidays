import { NextResponse } from 'next/server';
import { searchProperties } from '@/lib/holidays/services/search';
import { searchQuerySchema } from '@/lib/holidays/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    guests: searchParams.get('guests'),
    locale: searchParams.get('locale'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search query.' }, { status: 400 });
  }

  try {
    const results = await searchProperties(parsed.data);
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed.' },
      { status: 500 },
    );
  }
}
