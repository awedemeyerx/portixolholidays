import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'media.xmlcal.com',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
      },
      {
        protocol: 'https',
        hostname: 'portixolholidays.com',
      },
      {
        protocol: 'https',
        hostname: 'www.portixolholidays.com',
      },
      {
        protocol: 'https',
        hostname: 'rmuas7fp0d3ofmmb.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
