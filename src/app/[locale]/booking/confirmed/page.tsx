import type { Metadata } from 'next';
import Link from 'next/link';
import Stripe from 'stripe';
import { getBookingSession, getBookingSessionByStripeId } from '@/lib/holidays/cache/booking-sessions';
import { diffNights, formatMoney, formatStayDate } from '@/lib/holidays/dates';
import { safeLocale } from '@/lib/holidays/locale';
import { localizeProperty, localizeSiteSettings } from '@/lib/holidays/localize';
import { getPropertyBySlug, getSiteSettings } from '@/lib/holidays/services/cms';
import type { BookingSessionRecord, Locale, PriceBreakdown } from '@/lib/holidays/types';
import { loadMessages } from '@/lib/messages';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

type StripeSummary = {
  amountPaid: number;
  currency: string;
  customerEmail: string | null;
};

async function loadStripeSummary(sessionId: string): Promise<StripeSummary | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const amount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? 'eur').toUpperCase();
    const customerEmail =
      session.customer_details?.email ?? (typeof session.customer_email === 'string' ? session.customer_email : null);
    return { amountPaid: amount, currency, customerEmail };
  } catch {
    return null;
  }
}

export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = safeLocale(rawLocale) as Locale;
  const messages = await loadMessages(locale);
  const tC = messages.BookingConfirmed;

  const slug = pickParam(query.slug);
  const status = pickParam(query.status) ?? 'success';
  const sessionIdParam = pickParam(query.session_id) ?? pickParam(query.bookingSessionId);
  const stripeSessionId =
    pickParam(query.session_id) && pickParam(query.session_id) !== '{CHECKOUT_SESSION_ID}'
      ? pickParam(query.session_id)
      : undefined;
  const bookingIdParam = pickParam(query.booking_id);
  const checkIn = pickParam(query.checkIn);
  const checkOut = pickParam(query.checkOut);
  const guestsRaw = pickParam(query.guests);
  const guests = guestsRaw ? Number(guestsRaw) : undefined;

  let session: BookingSessionRecord | null = null;
  if (stripeSessionId) {
    session = await getBookingSessionByStripeId(stripeSessionId);
  }
  if (!session && sessionIdParam) {
    session = await getBookingSession(sessionIdParam);
  }

  const stripeSummary = stripeSessionId ? await loadStripeSummary(stripeSessionId) : null;
  const property = slug ? await getPropertyBySlug(slug, locale) : null;
  const settings = localizeSiteSettings(await getSiteSettings(), locale);

  const quote: PriceBreakdown | null = session?.quote.quote ?? null;
  const title =
    session?.quote.title ?? (property ? localizeProperty(property, locale).title : tC.fallbackTitle);
  const propertySlug = session?.propertySlug ?? slug ?? '';

  const effectiveCheckIn = session?.query.checkIn ?? checkIn;
  const effectiveCheckOut = session?.query.checkOut ?? checkOut;
  const effectiveGuests = session?.query.guests ?? guests;
  const nights = effectiveCheckIn && effectiveCheckOut ? diffNights(effectiveCheckIn, effectiveCheckOut) : null;

  const currency = quote?.currency ?? stripeSummary?.currency ?? 'EUR';
  const totalPrice = quote?.totalPrice ?? null;
  const depositAmount = quote?.depositAmount ?? stripeSummary?.amountPaid ?? null;
  const voucher = quote?.voucher;

  const isConfirmed = status === 'confirmed' || session?.status === 'booking_confirmed';
  const heading = isConfirmed ? tC.headingConfirmed : tC.headingSuccess;
  const body = isConfirmed ? tC.bodyConfirmed : tC.bodySuccess;

  const reference =
    session?.beds24BookingId ?? bookingIdParam ?? (stripeSessionId ? stripeSessionId.slice(-8).toUpperCase() : null);
  const customerEmail = session?.guest.email ?? stripeSummary?.customerEmail ?? null;

  const rangeLabel =
    effectiveCheckIn && effectiveCheckOut
      ? `${formatStayDate(effectiveCheckIn, locale)} – ${formatStayDate(effectiveCheckOut, locale)}`
      : null;

  return (
    <div className="bg-foam">
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="glass-card rounded-[2rem] p-8 md:p-12">
          <div className="flex items-center gap-3 text-sea">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sea/10 text-xl font-semibold"
            >
              ✓
            </span>
            <p className="label-caps text-xs">{tC.eyebrow}</p>
          </div>
          <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">{heading}</h1>
          <p className="mt-4 text-base leading-7 text-ink/72">{body}</p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-white/70 p-6 md:grid-cols-2">
            <div>
              <p className="label-caps text-[11px] text-sea">{tC.property}</p>
              <p className="mt-1 text-lg font-medium text-ink">{title}</p>
            </div>
            {rangeLabel ? (
              <div>
                <p className="label-caps text-[11px] text-sea">{tC.stay}</p>
                <p className="mt-1 text-sm text-ink">{rangeLabel}</p>
                {nights != null && effectiveGuests ? (
                  <p className="mt-1 text-sm text-ink/60">
                    {tC.nightsGuests.replace('{nights}', String(nights)).replace('{guests}', String(effectiveGuests))}
                  </p>
                ) : null}
              </div>
            ) : null}
            {reference ? (
              <div>
                <p className="label-caps text-[11px] text-sea">{tC.reference}</p>
                <p className="mt-1 font-mono text-sm text-ink">{reference}</p>
              </div>
            ) : null}
            {customerEmail ? (
              <div>
                <p className="label-caps text-[11px] text-sea">{tC.confirmationTo}</p>
                <p className="mt-1 text-sm text-ink">{customerEmail}</p>
              </div>
            ) : null}
          </div>

          {quote || depositAmount != null ? (
            <div className="mt-6 rounded-[1.5rem] bg-white/70 p-6 text-sm text-ink/80">
              <h2 className="label-caps text-[11px] text-sea">{tC.priceSummary}</h2>
              <dl className="mt-3 space-y-2">
                {quote ? (
                  <>
                    <div className="flex justify-between">
                      <dt>{tC.subtotal}</dt>
                      <dd>{formatMoney(quote.subtotal, currency, locale)}</dd>
                    </div>
                    {quote.cleaningFee > 0 ? (
                      <div className="flex justify-between">
                        <dt>{tC.cleaningFee}</dt>
                        <dd>{formatMoney(quote.cleaningFee, currency, locale)}</dd>
                      </div>
                    ) : null}
                    {quote.taxes > 0 ? (
                      <div className="flex justify-between">
                        <dt>{tC.taxes}</dt>
                        <dd>{formatMoney(quote.taxes, currency, locale)}</dd>
                      </div>
                    ) : null}
                    {voucher ? (
                      <div className="flex justify-between text-sea">
                        <dt>
                          {tC.voucher} ({voucher.code})
                        </dt>
                        <dd>-{formatMoney(voucher.discountAmount, currency, locale)}</dd>
                      </div>
                    ) : null}
                    {totalPrice != null ? (
                      <div className="flex justify-between border-t border-ink/10 pt-2 font-medium text-ink">
                        <dt>{tC.total}</dt>
                        <dd>{formatMoney(totalPrice, currency, locale)}</dd>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {depositAmount != null ? (
                  <div className="flex justify-between font-medium text-terracotta">
                    <dt>{isConfirmed ? tC.depositDue : tC.depositPaid}</dt>
                    <dd>{formatMoney(depositAmount, currency, locale)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.5rem] bg-white/70 p-6 text-sm text-ink/80">
            <h2 className="label-caps text-[11px] text-sea">{tC.nextSteps}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>{tC.step1}</li>
              <li>{tC.step2}</li>
              <li>{tC.step3}</li>
            </ul>
            {settings.supportEmail ? (
              <p className="mt-4 text-sm text-ink/70">
                {tC.questions}{' '}
                <a href={`mailto:${settings.supportEmail}`} className="font-medium text-sea underline-offset-4 hover:underline">
                  {settings.supportEmail}
                </a>
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-foam transition hover:bg-sea"
            >
              {tC.backToHome}
            </Link>
            {propertySlug ? (
              <Link
                href={`/${locale}/properties/${propertySlug}`}
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:bg-white"
              >
                {tC.backToProperty}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

