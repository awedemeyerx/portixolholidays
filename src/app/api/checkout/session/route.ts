import { NextResponse } from 'next/server';
import { createCheckoutForBooking } from '@/lib/holidays/services/booking';
import { checkoutPayloadSchema } from '@/lib/holidays/validation';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = checkoutPayloadSchema.parse(payload);

    const checkoutSession = await createCheckoutForBooking({
      slug: parsed.slug,
      locale: parsed.locale,
      query: {
        locale: parsed.locale,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests: parsed.guests,
      },
      guest: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        notes: parsed.notes || '',
        acceptedTerms: parsed.acceptedTerms,
        acceptedPrivacy: parsed.acceptedPrivacy,
      },
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout session failed.' },
      { status: 400 },
    );
  }
}
