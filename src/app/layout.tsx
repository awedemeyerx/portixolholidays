import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portixol Holidays',
  description: 'Secure and comfortable Mallorca holiday rentals in Portixol, El Molinar and Port d’Andratx.',
  icons: {
    icon: '/portixol-icon.png',
    shortcut: '/portixol-icon.png',
    apple: '/portixol-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="page-shell antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
