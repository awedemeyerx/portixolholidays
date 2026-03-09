'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { formatMoney } from '@/lib/holidays/dates';
import { StaySearchForm } from '@/components/search/stay-search-form';
import type { CalendarSnapshot, Locale, PropertyQuote } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  slug: string;
  selection: {
    checkIn: string;
    checkOut: string;
    guests: number;
  } | null;
  query: {
    checkIn: string;
    checkOut: string;
    guests: number;
  } | null;
  quote: PropertyQuote | null;
  calendar: CalendarSnapshot | null;
};

export function BookingPanel({ locale, slug, selection, query, quote, calendar }: Props) {
  const t = useTranslations('Property');
  const searchT = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const [isUpdatingStay, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const hasCompleteSelection = Boolean(selection?.checkIn && selection?.checkOut);

  function updateStay(nextStay: { checkIn: string; checkOut: string; guests: number }) {
    const params = new URLSearchParams();
    params.set('checkIn', nextStay.checkIn);
    params.set('checkOut', nextStay.checkOut);
    params.set('guests', String(nextStay.guests));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearStay() {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query || !quote) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          locale,
          ...query,
          ...bookingState,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(String(payload.error ?? 'Checkout session failed'));
      }

      if (payload.url) {
        window.location.href = payload.url;
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Checkout session failed');
      setLoading(false);
    }
  }

  return (
    <aside className="glass-card rounded-[2rem] p-6">
      <div className="space-y-2">
        <p className="label-caps text-xs text-sea">{t('booking')}</p>
        <h2 className="font-serif text-3xl">{quote ? quote.title : t('staySelection')}</h2>
        <p className="text-sm leading-7 text-ink/70">{quote ? t('bookingHint') : t('stayPrompt')}</p>
      </div>

      <div className="mt-6">
        <StaySearchForm
          locale={locale}
          initialCheckIn={selection?.checkIn ?? ''}
          initialCheckOut={selection?.checkOut ?? ''}
          initialGuests={selection?.guests ?? 2}
          submitLabel={t('checkAvailability')}
          loadingLabel={searchT('loading')}
          isPending={isUpdatingStay}
          calendar={calendar}
          onSubmit={updateStay}
          onClear={clearStay}
          submitClassName="rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60"
          labels={{
            arrival: searchT('arrival'),
            departure: searchT('departure'),
            guests: searchT('guests'),
            selectArrival: searchT('selectArrival'),
            selectDeparture: searchT('selectDeparture'),
            invalidRange: searchT('invalidRange'),
            resetDates: searchT('resetDates'),
            nights: searchT('nights'),
          }}
        />
      </div>

      {!quote || !query ? (
        <div className="mt-6 rounded-[1.5rem] border border-sea/10 bg-white/70 px-4 py-4 text-sm leading-7 text-ink/72">
          {hasCompleteSelection && query ? t('quoteUnavailable') : t('quoteMissing')}
        </div>
      ) : null}

      {quote && query ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <section className="space-y-4">
            <h3 className="label-caps text-[11px] text-sea">{t('guestDetails')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder={t('firstName')}
                className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                value={bookingState.firstName}
                onChange={(event) => setBookingState((current) => ({ ...current, firstName: event.target.value }))}
                required
              />
              <input
                placeholder={t('lastName')}
                className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                value={bookingState.lastName}
                onChange={(event) => setBookingState((current) => ({ ...current, lastName: event.target.value }))}
                required
              />
              <input
                type="email"
                placeholder={t('email')}
                className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                value={bookingState.email}
                onChange={(event) => setBookingState((current) => ({ ...current, email: event.target.value }))}
                required
              />
              <input
                placeholder={t('phone')}
                className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
                value={bookingState.phone}
                onChange={(event) => setBookingState((current) => ({ ...current, phone: event.target.value }))}
                required
              />
            </div>
            <textarea
              placeholder={t('notes')}
              className="soft-ring min-h-[120px] w-full rounded-2xl border-0 bg-white px-4 py-3"
              value={bookingState.notes}
              onChange={(event) => setBookingState((current) => ({ ...current, notes: event.target.value }))}
            />
          </section>

          <section className="space-y-3">
            <h3 className="label-caps text-[11px] text-sea">{t('legal')}</h3>
            <label className="flex items-start gap-3 text-sm text-ink/72">
              <input
                type="checkbox"
                checked={bookingState.acceptedTerms}
                onChange={(event) => setBookingState((current) => ({ ...current, acceptedTerms: event.target.checked }))}
                required
              />
              <span>{t('acceptTerms')}</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ink/72">
              <input
                type="checkbox"
                checked={bookingState.acceptedPrivacy}
                onChange={(event) => setBookingState((current) => ({ ...current, acceptedPrivacy: event.target.checked }))}
                required
              />
              <span>{t('acceptPrivacy')}</span>
            </label>
          </section>

          <section className="rounded-[1.5rem] bg-white/70 p-4">
            <h3 className="label-caps text-[11px] text-sea">{t('summary')}</h3>
            <div className="mt-3 space-y-2 text-sm text-ink/72">
              <p>{t('nights')}: {quote.quote.nights}</p>
              <p>{t('cancellation')}: {quote.cancellationSummary}</p>
              <p>Subtotal: {formatMoney(quote.quote.subtotal, quote.quote.currency, locale)}</p>
              <p>Cleaning: {formatMoney(quote.quote.cleaningFee, quote.quote.currency, locale)}</p>
              <p>Taxes: {formatMoney(quote.quote.taxes, quote.quote.currency, locale)}</p>
              <p className="font-medium text-ink">Total: {formatMoney(quote.quote.totalPrice, quote.quote.currency, locale)}</p>
              <p className="font-medium text-terracotta">
                {t('payDeposit')}: {formatMoney(quote.quote.depositAmount, quote.quote.currency, locale)}
              </p>
            </div>
          </section>

          {error ? <p className="rounded-2xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60"
          >
            {loading ? t('processing') : t('payDeposit')}
          </button>
        </form>
      ) : null}
    </aside>
  );
}
