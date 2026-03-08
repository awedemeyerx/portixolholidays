import type { Locale } from './holidays/types';

export async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import('@/messages/en.json')).default;
    case 'es':
      return (await import('@/messages/es.json')).default;
    default:
      return (await import('@/messages/de.json')).default;
  }
}
