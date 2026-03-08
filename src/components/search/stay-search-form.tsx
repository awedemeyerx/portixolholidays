'use client';

import { useEffect, useState } from 'react';
import { diffNights } from '@/lib/holidays/dates';
import type { Locale } from '@/lib/holidays/types';
import { DateRangePicker } from './date-range-picker';

type Props = {
  locale: Locale;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  submitLabel: string;
  loadingLabel: string;
  helperText?: string;
  isPending?: boolean;
  submitClassName?: string;
  onSubmit: (query: { checkIn: string; checkOut: string; guests: number }) => void;
  onClear?: () => void;
  labels: {
    arrival: string;
    departure: string;
    guests: string;
    selectArrival: string;
    selectDeparture: string;
    invalidRange: string;
    resetDates: string;
    nights: string;
  };
};

export function StaySearchForm({
  locale,
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 2,
  submitLabel,
  loadingLabel,
  helperText,
  isPending,
  submitClassName,
  onSubmit,
  onClear,
  labels,
}: Props) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  useEffect(() => {
    setCheckIn(initialCheckIn);
  }, [initialCheckIn]);

  useEffect(() => {
    setCheckOut(initialCheckOut);
  }, [initialCheckOut]);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const invalidRange = Boolean(checkIn && checkOut && diffNights(checkIn, checkOut) <= 0);
  const incompleteRange = !checkIn || !checkOut;

  function handleClear() {
    setCheckIn('');
    setCheckOut('');
    onClear?.();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalidRange || incompleteRange) return;
    onSubmit({ checkIn, checkOut, guests });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DateRangePicker
        locale={locale}
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={({ checkIn: nextCheckIn, checkOut: nextCheckOut }) => {
          setCheckIn(nextCheckIn);
          setCheckOut(nextCheckOut);
        }}
        labels={labels}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="grid gap-2">
          <span className="label-caps text-[11px] text-sea">{labels.guests}</span>
          <select
            name="guests"
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="soft-ring rounded-2xl border-0 bg-white px-4 py-3"
          >
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <button
            type="submit"
            className={submitClassName ?? 'rounded-full bg-ink px-5 py-4 text-sm font-medium text-foam transition hover:bg-sea disabled:opacity-60'}
            disabled={Boolean(isPending || invalidRange || incompleteRange)}
          >
            {isPending ? loadingLabel : submitLabel}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-mist transition hover:text-ink"
          >
            {labels.resetDates}
          </button>
        </div>
      </div>

      {helperText ? <p className="text-sm leading-6 text-ink/65">{helperText}</p> : null}
    </form>
  );
}
