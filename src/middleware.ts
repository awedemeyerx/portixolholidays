import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { LOCALES } from '@/lib/holidays/types';

const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: 'de',
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Set x-locale header so root layout can use dynamic html lang
  const pathname = request.nextUrl.pathname;
  const pathLocale = pathname.split('/')[1];
  if (LOCALES.includes(pathLocale as any)) {
    response.headers.set('x-locale', pathLocale);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
