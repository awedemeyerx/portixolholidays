import { NextResponse } from 'next/server';
import { constructStripeEvent, finalizeStripeCheckout } from '@/lib/holidays/services/booking';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  const body = await request.text();

  try {
    const event = await constructStripeEvent(body, signature);

    if (event.type === 'checkout.session.completed') {
      await finalizeStripeCheckout(event.data.object);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe webhook failed.' },
      { status: 400 },
    );
  }
}
