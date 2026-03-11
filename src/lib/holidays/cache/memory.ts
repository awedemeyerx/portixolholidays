type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function remember<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = loader().catch((error) => {
    const current = memoryCache.get(key);
    if (current?.value === value) {
      memoryCache.delete(key);
    }
    throw error;
  });

  memoryCache.set(key, {
    expiresAt: now + ttlMs,
    value,
  });

  return value;
}

export function clearRemembered(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}
