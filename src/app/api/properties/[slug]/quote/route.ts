import { NextResponse } from 'next/server';
import { getPropertyQuoteBySlug } from '@/lib/holidays/services/quote';
import { searchQuerySchema } from '@/lib/holidays/validation';

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    guests: searchParams.get('guests'),
    locale: searchParams.get('locale'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid quote query.' }, { status: 400 });
  }

  const quote = await getPropertyQuoteBySlug(slug, parsed.data);
  if (!quote) {
    return NextResponse.json({ error: 'Property quote not found.' }, { status: 404 });
  }

  return NextResponse.json(quote, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
