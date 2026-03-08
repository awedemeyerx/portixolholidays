import config from '@payload-config';

export function isCmsConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.PAYLOAD_SECRET?.trim());
}

export async function getPayloadClient() {
  if (!isCmsConfigured()) return null;
  const { getPayload } = await import('payload');
  return getPayload({ config });
}
