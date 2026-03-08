'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatMoney } from '@/lib/holidays/dates';
import type { Locale, PropertyQuote } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  slug: string;
  query: {
    checkIn: string;
    checkOut: string;
    guests: number;
  } | null;
  quote: PropertyQuote | null;
};

export function BookingPanel({ locale, slug, query, quote }: Props) {
  const t = useTranslations('Property');
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

  if (!quote || !query) {
    return (
      <aside className="glass-card rounded-[2rem] p-6">
        <p className="label-caps text-xs text-sea">{t('booking')}</p>
        <p className="mt-4 text-sm leading-7 text-ink/70">{t('quoteMissing')}</p>
      </aside>
    );
  }

  return (
    <aside className="glass-card rounded-[2rem] p-6">
      <div className="space-y-2">
        <p className="label-caps text-xs text-sea">{t('booking')}</p>
        <h2 className="font-serif text-3xl">{quote.title}</h2>
        <p className="text-sm leading-7 text-ink/70">{t('bookingHint')}</p>
      </div>

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
    </aside>
  );
}
