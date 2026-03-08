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
          'radial-gradient(circle at top, rgba(26, 125, 160, 0.18), transparent 35%), radial-gradient(circle at 80% 20%, rgba(191, 107, 71, 0.18), transparent 28%)',
      },
    },
  },
  plugins: [],
};

export default config;
