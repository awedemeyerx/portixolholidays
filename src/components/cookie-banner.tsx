'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const STORAGE_KEY = 'cookie-notice-dismissed';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations('Cookie');
  const locale = useLocale();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-ink/10 bg-ink px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-foam/85 sm:text-left">
          {t('notice')}{' '}
          <Link
            href={`/${locale}/legal/privacy`}
            className="underline transition hover:text-foam"
          >
            {t('learnMore')}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-sea px-5 py-2 text-sm font-medium text-white transition hover:bg-sea/90"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
