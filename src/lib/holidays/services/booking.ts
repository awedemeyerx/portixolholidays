import Stripe from 'stripe';
import { createBeds24Booking, isBeds24Configured } from '../beds24/client';
import { getBookingSession, saveBookingSession, updateBookingSession } from '../cache/booking-sessions';
import { getPropertyBySlug } from './cms';
import { getPropertyQuoteBySlug } from './quote';
import { toMinorUnits } from '../dates';
import type { BookingSessionRecord, GuestDetails, Locale, SearchQuery } from '../types';

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3000';
}

function sessionId() {
  return `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function splitName(guest: GuestDetails) {
  return `${guest.firstName} ${guest.lastName}`.trim();
}

export async function createCheckoutForBooking({
  slug,
  locale,
  query,
  guest,
}: {
  slug: string;
  locale: Locale;
  query: SearchQuery;
  guest: GuestDetails;
}) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured.');
  }

  const snapshotQuote = await getPropertyQuoteBySlug(slug, query);
  if (!snapshotQuote || !snapshotQuote.available) {
    throw new Error('This property is no longer available for the selected dates.');
  }
  const property = await getPropertyBySlug(slug, locale);
  if (!property) {
    throw new Error('Property not found.');
  }

  const id = sessionId();
  const session: BookingSessionRecord = {
    id,
    locale,
    propertyId: snapshotQuote.propertyId,
    propertySlug: snapshotQuote.slug,
    beds24PropertyId: property.beds24PropertyId,
    beds24RoomId: property.beds24RoomId,
    query,
    guest,
    quote: snapshotQuote,
    status: 'awaiting_payment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  await saveBookingSession(session);

  const successQuery = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
    booking: 'success',
    session_id: '{CHECKOUT_SESSION_ID}',
  });

  const cancelQuery = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
    booking: 'cancelled',
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: guest.email,
    metadata: {
      bookingSessionId: id,
      propertySlug: snapshotQuote.slug,
      locale,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: snapshotQuote.quote.currency.toLowerCase(),
          unit_amount: toMinorUnits(snapshotQuote.quote.depositAmount),
          product_data: {
            name: `${snapshotQuote.title} deposit`,
            description: `${query.checkIn} -> ${query.checkOut} · ${splitName(guest)}`,
          },
        },
      },
    ],
    success_url: `${baseUrl()}/${locale}/properties/${snapshotQuote.slug}?${successQuery.toString()}`,
    cancel_url: `${baseUrl()}/${locale}/properties/${snapshotQuote.slug}?${cancelQuery.toString()}`,
  });

  await updateBookingSession(id, (current) => ({
    ...current,
    updatedAt: new Date().toISOString(),
    stripeSessionId: checkoutSession.id,
  }));

  return checkoutSession;
}

async function refundOnConflict(stripe: Stripe, paymentIntentId: string) {
  await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: 'requested_by_customer',
    metadata: {
      reason: 'beds24_conflict_after_payment',
    },
  });
}

export async function finalizeStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const bookingSessionId = checkoutSession.metadata?.bookingSessionId;
  if (!bookingSessionId) return;

  const stripe = getStripeClient();
  const session = await getBookingSession(bookingSessionId);
  if (!session || !stripe) return;

  if (session.status === 'booking_confirmed') return;

  const liveQuote = await getPropertyQuoteBySlug(session.propertySlug, session.query, { forceLive: true });
  const paymentIntentId =
    typeof checkoutSession.payment_intent === 'string' ? checkoutSession.payment_intent : undefined;

  if (
    !liveQuote ||
    !liveQuote.available ||
    toMinorUnits(liveQuote.quote.totalPrice) !== toMinorUnits(session.quote.quote.totalPrice) ||
    toMinorUnits(liveQuote.quote.depositAmount) !== toMinorUnits(session.quote.quote.depositAmount)
  ) {
    if (paymentIntentId) {
      await refundOnConflict(stripe, paymentIntentId);
    }
    await updateBookingSession(session.id, (current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      status: 'conflict_after_payment',
      stripePaymentIntentId: paymentIntentId,
      lastError: 'Beds24 availability or pricing changed after payment.',
    }));
    return;
  }

  let beds24BookingId = session.id;

  if (isBeds24Configured()) {
    try {
      beds24BookingId = await createBeds24Booking({
        ...session,
        quote: liveQuote,
      });
    } catch (error) {
      await updateBookingSession(session.id, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        status: 'external_booking_failed',
        stripePaymentIntentId: paymentIntentId,
        lastError: error instanceof Error ? error.message : 'Beds24 booking failed.',
      }));
      return;
    }
  }

  await updateBookingSession(session.id, (current) => ({
    ...current,
    updatedAt: new Date().toISOString(),
    status: 'booking_confirmed',
    stripePaymentIntentId: paymentIntentId,
    beds24BookingId,
    quote: liveQuote,
  }));
}

export async function constructStripeEvent(body: string, signature: string) {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    throw new Error('Stripe webhook is not configured.');
  }
  return stripe.webhooks.constructEvent(body, signature, secret);
}
