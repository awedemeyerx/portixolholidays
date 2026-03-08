'use client';

import { useEffect, useMemo, useState } from 'react';
import { diffNights, formatStayDate, parseDate, toDateKey } from '@/lib/holidays/dates';
import type { Locale } from '@/lib/holidays/types';

type Props = {
  locale: Locale;
  checkIn: string;
  checkOut: string;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
  minDate?: string;
  labels: {
    arrival: string;
    departure: string;
    selectArrival: string;
    selectDeparture: string;
    invalidRange: string;
    resetDates: string;
    nights: string;
  };
};

type ActiveField = 'checkIn' | 'checkOut';

type CalendarCell = {
  key: string;
  dayLabel: string;
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
};

function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

function monthId(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function monthStart(value: string) {
  const date = parseDate(value);
  date.setDate(1);
  return date;
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - offset);
  return next;
}

function buildMonthGrid(viewMonth: Date, minDate: string) {
  const today = toDateKey(new Date());
  const gridStart = startOfWeek(viewMonth);
  return Array.from({ length: 42 }, (_, index): CalendarCell => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);
    const key = toDateKey(cellDate);
    return {
      key,
      dayLabel: String(cellDate.getDate()),
      inMonth: cellDate.getMonth() === viewMonth.getMonth(),
      disabled: compareDateKeys(key, minDate) < 0,
      isToday: key === today,
    };
  });
}

function weekdayLabels(locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const monday = new Date('2026-03-02T00:00:00');
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return formatter.format(next);
  });
}

function monthLabel(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function DateRangePicker({ locale, checkIn, checkOut, onChange, minDate, labels }: Props) {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const effectiveMinDate = minDate ?? todayKey;
  const [activeField, setActiveField] = useState<ActiveField>(checkIn ? 'checkOut' : 'checkIn');
  const [hoveredDate, setHoveredDate] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(checkIn || effectiveMinDate));

  useEffect(() => {
    if (!checkIn) {
      setActiveField('checkIn');
      return;
    }

    if (!checkOut || diffNights(checkIn, checkOut) <= 0) {
      setActiveField('checkOut');
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!checkIn) return;

    const targetMonth = monthStart(checkIn || effectiveMinDate);
    const secondMonth = addMonths(visibleMonth, 1);
    if (monthId(targetMonth) < monthId(visibleMonth) || monthId(targetMonth) > monthId(secondMonth)) {
      setVisibleMonth(targetMonth);
    }
  }, [checkIn, effectiveMinDate, visibleMonth]);

  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const months = useMemo(() => [visibleMonth, addMonths(visibleMonth, 1)], [visibleMonth]);
  const invalidRange = Boolean(checkIn && checkOut && diffNights(checkIn, checkOut) <= 0);
  const previewEnd = activeField === 'checkOut' && hoveredDate ? hoveredDate : checkOut;
  const previewInvalid = Boolean(checkIn && previewEnd && compareDateKeys(previewEnd, checkIn) <= 0);
  const hasValidRange = Boolean(checkIn && checkOut && !invalidRange);
  const totalNights = hasValidRange ? diffNights(checkIn, checkOut) : 0;

  function selectDate(nextDate: string) {
    if (!checkIn || activeField === 'checkIn') {
      onChange({ checkIn: nextDate, checkOut: '' });
      setActiveField('checkOut');
      setHoveredDate('');
      return;
    }

    onChange({ checkIn, checkOut: nextDate });
    if (compareDateKeys(nextDate, checkIn) > 0) {
      setActiveField('checkIn');
    }
    setHoveredDate('');
  }

  function clearDates() {
    onChange({ checkIn: '', checkOut: '' });
    setActiveField('checkIn');
    setHoveredDate('');
    setVisibleMonth(monthStart(effectiveMinDate));
  }

  const earliestMonth = monthStart(effectiveMinDate);
  const canGoPrev = monthId(addMonths(visibleMonth, -1)) >= monthId(earliestMonth);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setActiveField('checkIn')}
          className={`stay-boundary ${activeField === 'checkIn' ? 'stay-boundary-active' : ''} ${invalidRange ? 'stay-boundary-invalid' : ''}`}
        >
          <span className="label-caps text-[11px] text-sea">{labels.arrival}</span>
          <strong className="mt-2 block text-left text-lg font-medium text-ink">
            {checkIn ? formatStayDate(checkIn, locale) : labels.selectArrival}
          </strong>
        </button>
        <button
          type="button"
          onClick={() => setActiveField('checkOut')}
          className={`stay-boundary ${activeField === 'checkOut' ? 'stay-boundary-active' : ''} ${invalidRange ? 'stay-boundary-invalid' : ''}`}
        >
          <span className="label-caps text-[11px] text-sea">{labels.departure}</span>
          <strong className="mt-2 block text-left text-lg font-medium text-ink">
            {checkOut ? formatStayDate(checkOut, locale) : labels.selectDeparture}
          </strong>
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/78">
        <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
          <div className="text-sm text-ink/68">
            {invalidRange
              ? labels.invalidRange
              : hasValidRange
                ? `${totalNights} ${labels.nights}`
                : checkIn
                  ? labels.selectDeparture
                  : labels.selectArrival}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              disabled={!canGoPrev}
              className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {'<'}
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink transition hover:border-sea/30 hover:bg-sea/5"
            >
              {'>'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-4 md:grid-cols-2">
          {months.map((month) => {
            const monthCells = buildMonthGrid(month, effectiveMinDate);
            const label = monthLabel(locale, month);
            return (
              <div key={label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl capitalize">{label}</h3>
                  <button
                    type="button"
                    onClick={clearDates}
                    className="text-sm text-terracotta transition hover:text-ink"
                  >
                    {labels.resetDates}
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-mist">
                  {weekdays.map((weekday) => (
                    <span key={`${label}-${weekday}`} className="pb-1">
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {monthCells.map((cell) => {
                    const isStart = cell.key === checkIn;
                    const isEnd = cell.key === checkOut;
                    const hasPreview = Boolean(checkIn && previewEnd);
                    const lowerBoundary = hasPreview
                      ? compareDateKeys(checkIn, previewEnd || checkIn) <= 0
                        ? checkIn
                        : previewEnd || checkIn
                      : '';
                    const upperBoundary = hasPreview
                      ? compareDateKeys(checkIn, previewEnd || checkIn) <= 0
                        ? previewEnd || checkIn
                        : checkIn
                      : '';
                    const inPreviewRange = Boolean(
                      hasPreview &&
                        compareDateKeys(cell.key, lowerBoundary) > 0 &&
                        compareDateKeys(cell.key, upperBoundary) < 0,
                    );

                    const dayClass = [
                      'stay-day',
                      cell.inMonth ? 'stay-day-current' : 'stay-day-muted',
                      cell.disabled ? 'stay-day-disabled' : '',
                      cell.isToday ? 'stay-day-today' : '',
                      inPreviewRange ? (previewInvalid ? 'stay-day-invalid-range' : 'stay-day-range') : '',
                      isStart || isEnd ? (previewInvalid ? 'stay-day-invalid-boundary' : 'stay-day-boundary') : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={cell.disabled}
                        onClick={() => selectDate(cell.key)}
                        onMouseEnter={() => !cell.disabled && setHoveredDate(cell.key)}
                        onMouseLeave={() => setHoveredDate('')}
                        className={dayClass}
                        aria-pressed={isStart || isEnd}
                      >
                        {cell.dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
