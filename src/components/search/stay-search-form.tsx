'use client';

import { useEffect, useState } from 'react';
import { diffNights } from '@/lib/holidays/dates';
import type { CalendarSnapshot, Locale } from '@/lib/holidays/types';
import { DateRangePicker } from './date-range-picker';

type Props = {
  locale: Locale;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialLocations?: string[];
  submitLabel: string;
  loadingLabel: string;
  helperText?: string;
  isPending?: boolean;
  submitClassName?: string;
  calendar?: CalendarSnapshot | null;
  calendars?: CalendarSnapshot[] | null;
  locationOptions?: Array<{ value: string; label: string; propertyCount?: number }>;
  onSubmit: (query: { checkIn: string; checkOut: string; guests: number; locations: string[] }) => void;
  onClear?: () => void;
  labels: {
    arrival: string;
    departure: string;
    guests: string;
    locations: string;
    allLocations: string;
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
  initialLocations = [],
  submitLabel,
  loadingLabel,
  helperText,
  isPending,
  submitClassName,
  calendar,
  calendars,
  locationOptions,
  onSubmit,
  onClear,
  labels,
}: Props) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [locations, setLocations] = useState<string[]>(initialLocations);

  useEffect(() => {
    setCheckIn(initialCheckIn);
  }, [initialCheckIn]);

  useEffect(() => {
    setCheckOut(initialCheckOut);
  }, [initialCheckOut]);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  useEffect(() => {
    setLocations(initialLocations);
  }, [initialLocations]);

  const invalidRange = Boolean(checkIn && checkOut && diffNights(checkIn, checkOut) <= 0);
  const incompleteRange = !checkIn || !checkOut;
  const hasSelectedDates = Boolean(checkIn || checkOut);

  function handleClear() {
    setCheckIn('');
    setCheckOut('');
    onClear?.();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalidRange || incompleteRange) return;
    onSubmit({ checkIn, checkOut, guests, locations });
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
        calendar={calendar}
        calendars={calendars}
        labels={labels}
      />

      {locationOptions && locationOptions.length > 0 ? (
        <div className="grid gap-2">
          <span className="label-caps text-[11px] text-sea">{labels.locations}</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLocations([])}
              className={`rounded-full px-4 py-2 text-sm transition ${
                locations.length === 0
                  ? 'bg-sea text-white'
                  : 'bg-white text-ink/72 hover:bg-sea/8'
              }`}
            >
              {labels.allLocations}
            </button>
            {locationOptions.map((option) => {
              const selected = locations.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setLocations((current) =>
                      current.includes(option.value)
                        ? current.filter((value) => value !== option.value)
                        : [...current, option.value],
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selected
                      ? 'bg-sea text-white'
                      : 'bg-white text-ink/72 hover:bg-sea/8'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

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
          {hasSelectedDates ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-mist transition hover:text-ink"
            >
              {labels.resetDates}
            </button>
          ) : null}
        </div>
      </div>

      {helperText ? <p className="text-sm leading-6 text-ink/65">{helperText}</p> : null}
    </form>
  );
}
