import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createCheckoutForBooking } from '@/lib/holidays/services/booking';
import type { Locale } from '@/lib/holidays/types';
import { checkoutPayloadSchema } from '@/lib/holidays/validation';

const LOCALES: Locale[] = ['de', 'en', 'es'];

const copy = {
  de: {
    validationError: 'Bitte prüfe deine Eingaben.',
    checkoutUnavailable: 'Für diese Auswahl konnten wir die Buchung gerade nicht starten. Bitte prüfe den Zeitraum erneut.',
    checkoutFailed: 'Die Buchung konnte gerade nicht gestartet werden. Bitte versuche es erneut.',
    fields: {
      firstName: 'Bitte gib deinen Vornamen ein.',
      lastName: 'Bitte gib deinen Nachnamen ein.',
      email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      phone: 'Bitte gib eine Telefonnummer mit mindestens 5 Zeichen ein.',
      acceptedTerms: 'Bitte akzeptiere die Buchungsbedingungen.',
      acceptedPrivacy: 'Bitte akzeptiere die Datenschutzhinweise.',
    },
  },
  en: {
    validationError: 'Please review your details.',
    checkoutUnavailable: 'We could not start this booking for the selected dates right now. Please check the stay again.',
    checkoutFailed: 'We could not start the booking right now. Please try again.',
    fields: {
      firstName: 'Please enter your first name.',
      lastName: 'Please enter your last name.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a phone number with at least 5 characters.',
      acceptedTerms: 'Please accept the booking terms.',
      acceptedPrivacy: 'Please accept the privacy notice.',
    },
  },
  es: {
    validationError: 'Por favor, revisa tus datos.',
    checkoutUnavailable: 'No hemos podido iniciar la reserva para estas fechas en este momento. Vuelve a comprobar la estancia.',
    checkoutFailed: 'No hemos podido iniciar la reserva en este momento. Inténtalo de nuevo.',
    fields: {
      firstName: 'Introduce tu nombre.',
      lastName: 'Introduce tus apellidos.',
      email: 'Introduce un correo electrónico válido.',
      phone: 'Introduce un teléfono con al menos 5 caracteres.',
      acceptedTerms: 'Debes aceptar las condiciones de reserva.',
      acceptedPrivacy: 'Debes aceptar la política de privacidad.',
    },
  },
} as const;

function resolveLocale(value: unknown): Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale) ? (value as Locale) : 'de';
}

function validationResponse(error: ZodError, locale: Locale) {
  const fieldErrors = error.issues.reduce<Record<string, string>>((accumulator, issue) => {
    const field = String(issue.path[0] ?? '');
    if (!field || accumulator[field]) return accumulator;

    if (field in copy[locale].fields) {
      accumulator[field] = copy[locale].fields[field as keyof (typeof copy)[typeof locale]['fields']];
    }

    return accumulator;
  }, {});

  return NextResponse.json(
    {
      error: copy[locale].validationError,
      fieldErrors,
    },
    { status: 400 },
  );
}

function checkoutErrorResponse(error: unknown, locale: Locale) {
  const message = error instanceof Error ? error.message : '';
  const userMessage = message.includes('no longer available')
    ? copy[locale].checkoutUnavailable
    : copy[locale].checkoutFailed;

  return NextResponse.json({ error: userMessage }, { status: 400 });
}

function resolveRequestOrigin(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();

  if (forwardedHost) {
    return `${forwardedProto || 'https'}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let locale: Locale = 'de';

  try {
    const payload = await request.json();
    locale = resolveLocale(payload?.locale);
    const parsed = checkoutPayloadSchema.parse(payload);

    const checkoutSession = await createCheckoutForBooking({
      returnBaseUrl: resolveRequestOrigin(request),
      slug: parsed.slug,
      locale: parsed.locale,
      query: {
        locale: parsed.locale,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests: parsed.guests,
      },
      guest: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        notes: parsed.notes || '',
        acceptedTerms: parsed.acceptedTerms,
        acceptedPrivacy: parsed.acceptedPrivacy,
      },
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationResponse(error, locale);
    }
    return checkoutErrorResponse(error, locale);
  }
}
