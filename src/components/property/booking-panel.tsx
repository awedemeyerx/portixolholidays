'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { formatMoney } from '@/lib/holidays/dates';
import { StaySearchForm } from '@/components/search/stay-search-form';
import type { CalendarSnapshot, Locale, PropertyQuote } from '@/lib/holidays/types';

type BookingField = 'firstName' | 'lastName' | 'email' | 'phone' | 'acceptedTerms' | 'acceptedPrivacy';
type BookingFieldErrors = Partial<Record<BookingField, string>>;

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
  const directBookingMode = process.env.NEXT_PUBLIC_BOOKING_DIRECT_MODE === 'true';
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [activeQuote, setActiveQuote] = useState<PropertyQuote | null>(quote);
  const [activeQuery, setActiveQuery] = useState(query);
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [bookingState, setBookingState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
  });
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [voucherApplying, setVoucherApplying] = useState(false);

  useEffect(() => {
    setActiveQuote(quote);
  }, [quote]);

  useEffect(() => {
    setActiveQuery(query);
  }, [query]);

  const hasCompleteSelection = Boolean(
    (selection?.checkIn && selection?.checkOut) || (activeQuery?.checkIn && activeQuery?.checkOut),
  );

  function clearFieldError(field: BookingField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fieldClass(field: BookingField) {
    return `soft-ring rounded-2xl border-0 bg-white px-4 py-3 ${
      fieldErrors[field] ? 'ring-1 ring-terracotta/40' : ''
    }`;
  }

  function buildQuoteUrl(
    nextStay: { checkIn: string; checkOut: string; guests: number },
    voucher?: string | null,
  ) {
    const params = new URLSearchParams({
      checkIn: nextStay.checkIn,
      checkOut: nextStay.checkOut,
      guests: String(nextStay.guests),
      locale,
    });
    if (voucher) params.set('voucher', voucher);
    return `/api/properties/${encodeURIComponent(slug)}/quote?${params.toString()}`;
  }

  function voucherErrorMessage(code: string | null | undefined): string {
    switch (code) {
      case 'not_found':
        return t('voucherInvalid');
      case 'inactive':
        return t('voucherInactive');
      case 'not_yet_valid':
        return t('voucherNotYetValid');
      case 'expired':
        return t('voucherExpired');
      case 'max_uses_reached':
        return t('voucherMaxUses');
      case 'min_nights_not_met':
        return t('voucherMinNights');
      case 'min_subtotal_not_met':
        return t('voucherMinSubtotal');
      case 'property_not_eligible':
        return t('voucherNotEligible');
      default:
        return t('voucherInvalid');
    }
  }

  function updateStay(nextStay: { checkIn: string; checkOut: string; guests: number; locations: string[] }) {
    const params = new URLSearchParams();
    params.set('checkIn', nextStay.checkIn);
    params.set('checkOut', nextStay.checkOut);
    params.set('guests', String(nextStay.guests));

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(null);
    setQuoteError(null);
    setActiveQuery({
      checkIn: nextStay.checkIn,
      checkOut: nextStay.checkOut,
      guests: nextStay.guests,
    });
    setActiveQuote(null);
    setIsFetchingQuote(true);

    void fetch(buildQuoteUrl(nextStay, appliedVoucherCode), { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          if (requestIdRef.current !== requestId) return;
          setActiveQuote(null);
          if (payload.error === 'min_stay') {
            setQuoteError(t('quoteMinStay', { minStay: payload.minStay, nights: payload.nights }));
          } else {
            setQuoteError(t('quoteUnavailable'));
          }
          return;
        }
        const nextQuote = (await response.json()) as PropertyQuote & { voucherError?: string | null };
        if (requestIdRef.current !== requestId) return;
        setActiveQuote(nextQuote);
        if (appliedVoucherCode && nextQuote.voucherError) {
          setAppliedVoucherCode(null);
          setVoucherMessage(voucherErrorMessage(nextQuote.voucherError));
        } else if (appliedVoucherCode && nextQuote.quote.voucher) {
          setVoucherMessage(null);
        }
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setActiveQuote(null);
        setQuoteError(t('quoteUnavailable'));
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setIsFetchingQuote(false);
      });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  async function applyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code || !activeQuery) return;
    setVoucherApplying(true);
    setVoucherMessage(null);

    try {
      const response = await fetch(buildQuoteUrl(activeQuery, code), { cache: 'no-store' });
      const payload = (await response.json()) as PropertyQuote & { voucherError?: string | null; error?: string };

      if (!response.ok) {
        setVoucherMessage(t('voucherInvalid'));
        return;
      }

      if (payload.voucherError) {
        setVoucherMessage(voucherErrorMessage(payload.voucherError));
        setAppliedVoucherCode(null);
        return;
      }

      if (payload.quote?.voucher) {
        setActiveQuote(payload);
        setAppliedVoucherCode(code);
        setVoucherInput(code);
        setVoucherMessage(null);
      } else {
        setVoucherMessage(t('voucherInvalid'));
      }
    } catch {
      setVoucherMessage(t('voucherInvalid'));
    } finally {
      setVoucherApplying(false);
    }
  }

  async function removeVoucher() {
    if (!activeQuery) return;
    setVoucherApplying(true);
    setVoucherMessage(null);

    try {
      const response = await fetch(buildQuoteUrl(activeQuery, null), { cache: 'no-store' });
      if (response.ok) {
        const payload = (await response.json()) as PropertyQuote;
        setActiveQuote(payload);
      }
    } catch {
      // ignore
    } finally {
      setAppliedVoucherCode(null);
      setVoucherInput('');
      setVoucherApplying(false);
    }
  }

  function clearStay() {
    requestIdRef.current += 1;
    setQuoteError(null);
    setActiveQuote(null);
    setActiveQuery(null);
    setIsFetchingQuote(false);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeQuery || !activeQuote) return;
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          locale,
          ...activeQuery,
          ...bookingState,
          voucherCode: appliedVoucherCode ?? undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (payload.fieldErrors && typeof payload.fieldErrors === 'object') {
          setFieldErrors(payload.fieldErrors as BookingFieldErrors);
        }
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
        <h2 className="font-serif text-3xl">{activeQuote ? activeQuote.title : t('staySelection')}</h2>
        <p className="text-sm leading-7 text-ink/70">{activeQuote ? t('bookingHint') : t('stayPrompt')}</p>
      </div>

      <div className="mt-6">
        <StaySearchForm
          locale={locale}
          initialCheckIn={selection?.checkIn ?? ''}
          initialCheckOut={selection?.checkOut ?? ''}
          initialGuests={selection?.guests ?? 2}
          submitLabel={t('checkAvailability')}
          loadingLabel={searchT('loading')}
          isPending={isFetchingQuote}
          calendar={calendar}
          onSubmit={updateStay}
          onClear={clearStay}
          submitClassName="rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60"
          labels={{
            arrival: searchT('arrival'),
            departure: searchT('departure'),
            guests: searchT('guests'),
            locations: searchT('locations'),
            allLocations: searchT('allLocations'),
            selectArrival: searchT('selectArrival'),
            selectDeparture: searchT('selectDeparture'),
            invalidRange: searchT('invalidRange'),
            resetDates: searchT('resetDates'),
            nights: searchT('nights'),
          }}
        />
      </div>

      {isFetchingQuote && activeQuery ? (
        <div className="mt-6 rounded-[1.5rem] border border-sea/10 bg-white/70 px-4 py-4 text-sm leading-7 text-ink/72">
          <div className="flex items-center gap-3">
            <span className="loading-wheel" aria-hidden="true" />
            <span>{t('checkingQuote')}</span>
          </div>
        </div>
      ) : null}

      {!isFetchingQuote && quoteError ? (
        <div className="mt-6 rounded-[1.5rem] border border-terracotta/10 bg-terracotta/8 px-4 py-4 text-sm leading-7 text-terracotta">
          {quoteError}
        </div>
      ) : null}

      {!isFetchingQuote && !quoteError && (!activeQuote || !activeQuery) ? (
        <div className="mt-6 rounded-[1.5rem] border border-sea/10 bg-white/70 px-4 py-4 text-sm leading-7 text-ink/72">
          {hasCompleteSelection && activeQuery ? t('quoteUnavailable') : t('quoteMissing')}
        </div>
      ) : null}

      {activeQuote && activeQuery ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <section className="rounded-[1.5rem] bg-white/70 p-4">
            <h3 className="label-caps text-[11px] text-sea">{t('summary')}</h3>
            <div className="mt-3 space-y-2 text-sm text-ink/72">
              <p>{t('nights')}: {activeQuote.quote.nights}</p>
              <p>{t('cancellation')}: {activeQuote.cancellationSummary}</p>
              <p>{t('subtotal')}: {formatMoney(activeQuote.quote.subtotal, activeQuote.quote.currency, locale)}</p>
              <p>{t('cleaningFee')}: {formatMoney(activeQuote.quote.cleaningFee, activeQuote.quote.currency, locale)}</p>
              <p>{t('mallorcaTouristTax')}: {formatMoney(activeQuote.quote.taxes, activeQuote.quote.currency, locale)}</p>
              {activeQuote.quote.voucher ? (
                <p className="text-sea">
                  {t('voucherDiscount')} ({activeQuote.quote.voucher.code}): -{formatMoney(activeQuote.quote.voucher.discountAmount, activeQuote.quote.currency, locale)}
                </p>
              ) : null}
              <p className="font-medium text-ink">{t('totalLabel')}: {formatMoney(activeQuote.quote.totalPrice, activeQuote.quote.currency, locale)}</p>
              <p className="font-medium text-terracotta">
                {t('payDeposit')}: {formatMoney(activeQuote.quote.depositAmount, activeQuote.quote.currency, locale)}
              </p>
            </div>
          </section>

          <section className="rounded-[1.5rem] bg-white/70 p-4">
            <h3 className="label-caps text-[11px] text-sea">{t('voucherHeading')}</h3>
            {appliedVoucherCode && activeQuote.quote.voucher ? (
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink/80">
                <span>
                  {t('voucherApplied')}: <strong className="font-medium text-ink">{activeQuote.quote.voucher.code}</strong>
                </span>
                <button
                  type="button"
                  onClick={removeVoucher}
                  disabled={voucherApplying}
                  className="text-xs font-medium text-terracotta underline-offset-4 hover:underline disabled:opacity-60"
                >
                  {t('voucherRemove')}
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  placeholder={t('voucherPlaceholder')}
                  className="soft-ring flex-1 rounded-2xl border-0 bg-white px-4 py-3 uppercase"
                  value={voucherInput}
                  onChange={(event) => {
                    setVoucherInput(event.target.value);
                    if (voucherMessage) setVoucherMessage(null);
                  }}
                />
                <button
                  type="button"
                  onClick={applyVoucher}
                  disabled={voucherApplying || !voucherInput.trim()}
                  className="rounded-full bg-sea px-5 py-3 text-sm font-medium text-foam transition hover:bg-ink disabled:opacity-60"
                >
                  {voucherApplying ? t('voucherChecking') : t('voucherApply')}
                </button>
              </div>
            )}
            {voucherMessage ? (
              <p className="mt-3 text-sm text-terracotta">{voucherMessage}</p>
            ) : null}
          </section>

          <section className="space-y-4">
            <h3 className="label-caps text-[11px] text-sea">{t('guestDetails')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <input
                  placeholder={t('firstName')}
                  className={fieldClass('firstName')}
                  value={bookingState.firstName}
                  onChange={(event) => {
                    clearFieldError('firstName');
                    setError(null);
                    setBookingState((current) => ({ ...current, firstName: event.target.value }));
                  }}
                  required
                />
                {fieldErrors.firstName ? <p className="text-sm text-terracotta">{fieldErrors.firstName}</p> : null}
              </div>
              <div className="space-y-2">
                <input
                  placeholder={t('lastName')}
                  className={fieldClass('lastName')}
                  value={bookingState.lastName}
                  onChange={(event) => {
                    clearFieldError('lastName');
                    setError(null);
                    setBookingState((current) => ({ ...current, lastName: event.target.value }));
                  }}
                  required
                />
                {fieldErrors.lastName ? <p className="text-sm text-terracotta">{fieldErrors.lastName}</p> : null}
              </div>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder={t('email')}
                  className={fieldClass('email')}
                  value={bookingState.email}
                  onChange={(event) => {
                    clearFieldError('email');
                    setError(null);
                    setBookingState((current) => ({ ...current, email: event.target.value }));
                  }}
                  required
                />
                {fieldErrors.email ? <p className="text-sm text-terracotta">{fieldErrors.email}</p> : null}
              </div>
              <div className="space-y-2">
                <input
                  type="tel"
                  placeholder={t('phone')}
                  className={fieldClass('phone')}
                  value={bookingState.phone}
                  onChange={(event) => {
                    clearFieldError('phone');
                    setError(null);
                    setBookingState((current) => ({ ...current, phone: event.target.value }));
                  }}
                  required
                />
                {fieldErrors.phone ? <p className="text-sm text-terracotta">{fieldErrors.phone}</p> : null}
              </div>
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
                onChange={(event) => {
                  clearFieldError('acceptedTerms');
                  setError(null);
                  setBookingState((current) => ({ ...current, acceptedTerms: event.target.checked }));
                }}
                required
              />
              <span>{t('acceptTerms')}</span>
            </label>
            {fieldErrors.acceptedTerms ? <p className="text-sm text-terracotta">{fieldErrors.acceptedTerms}</p> : null}
            <label className="flex items-start gap-3 text-sm text-ink/72">
              <input
                type="checkbox"
                checked={bookingState.acceptedPrivacy}
                onChange={(event) => {
                  clearFieldError('acceptedPrivacy');
                  setError(null);
                  setBookingState((current) => ({ ...current, acceptedPrivacy: event.target.checked }));
                }}
                required
              />
              <span>{t('acceptPrivacy')}</span>
            </label>
            {fieldErrors.acceptedPrivacy ? <p className="text-sm text-terracotta">{fieldErrors.acceptedPrivacy}</p> : null}
          </section>

          {error ? <p className="rounded-2xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60"
          >
            {loading ? (directBookingMode ? t('processingBooking') : t('processing')) : directBookingMode ? t('confirmBooking') : t('payDeposit')}
          </button>
        </form>
      ) : null}
    </aside>
  );
}
