import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { LOCALES, type Locale } from '@/lib/holidays/types';
import { loadMessages } from '@/lib/messages';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(LOCALES, requested) ? (requested as Locale) : 'de';

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
