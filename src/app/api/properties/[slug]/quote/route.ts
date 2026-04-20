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
    locations: searchParams.getAll('location'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid quote query.' }, { status: 400 });
  }

  const voucherCode = searchParams.get('voucher') ?? undefined;
  const result = await getPropertyQuoteBySlug(slug, parsed.data, { voucherCode });
  if (!result.ok) {
    if (result.reason === 'min_stay') {
      return NextResponse.json(
        { error: 'min_stay', minStay: result.minStay, nights: result.nights },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Property quote not found.' }, { status: 404 });
  }

  return NextResponse.json(
    { ...result.quote, voucherError: result.voucherError ?? null },
    {
      headers: {
        'Cache-Control': voucherCode ? 'no-store' : 'public, max-age=0, s-maxage=120, stale-while-revalidate=600',
      },
    },
  );
}
