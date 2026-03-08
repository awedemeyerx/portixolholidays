import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portixol Holidays',
  description: 'Holiday rentals in Mallorca with a custom booking engine powered by Beds24 data.',
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
