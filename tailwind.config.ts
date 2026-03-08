import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/messages/**/*.json',
  ],
  theme: {
    extend: {
      colors: {
        sand: 'var(--sand)',
        ink: 'var(--ink)',
        sea: 'var(--sea)',
        terracotta: 'var(--terracotta)',
        foam: 'var(--foam)',
        mist: 'var(--mist)',
      },
      boxShadow: {
        card: '0 30px 80px rgba(12, 39, 62, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(62, 146, 168, 0.22), transparent 36%), radial-gradient(circle at 82% 18%, rgba(199, 124, 91, 0.18), transparent 30%), linear-gradient(135deg, rgba(219, 239, 244, 0.42), rgba(255, 248, 240, 0.08))',
      },
    },
  },
  plugins: [],
};

export default config;
