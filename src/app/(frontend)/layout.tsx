import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { headers } from 'next/headers';
import { BASE_URL } from '@/lib/holidays/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Portixol Holidays — Mallorca Holiday Rentals',
    template: '%s | Portixol Holidays',
  },
  description: 'Handverlesene Ferienhäuser in Portixol, El Molinar und Port d\'Andratx. Prüfe freie Termine und reserviere deinen Traumurlaub auf Mallorca.',
  icons: {
    icon: '/portixol-icon.png',
    shortcut: '/portixol-icon.png',
    apple: '/portixol-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Portixol Holidays',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get('x-locale') || 'de';

  return (
    <html lang={lang}>
      <body className="page-shell antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
