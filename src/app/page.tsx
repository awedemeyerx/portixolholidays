import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { detectLocale } from '@/lib/holidays/locale';

export default async function RootPage() {
  const headerList = await headers();
  const locale = detectLocale(headerList.get('accept-language'));
  redirect(`/${locale}`);
}
