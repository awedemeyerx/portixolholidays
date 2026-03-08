import type { Locale } from './types';

export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function diffNights(checkIn: string, checkOut: string): number {
  const from = parseDate(checkIn).getTime();
  const to = parseDate(checkOut).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function enumerateNights(checkIn: string, checkOut: string): string[] {
  const nights = diffNights(checkIn, checkOut);
  return Array.from({ length: nights }, (_, index) => addDays(checkIn, index));
}

export function formatStayDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parseDate(value));
}

export function formatMoney(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
