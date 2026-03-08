import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

type StoredValue<T> = {
  expiresAt: string;
  value: T;
};

const ROOT_DIR = process.env.PORTIXOL_CACHE_DIR || path.join(os.tmpdir(), 'portixol-holidays-cache');

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

async function ensureDir(bucket: string) {
  const dir = path.join(ROOT_DIR, sanitize(bucket));
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function filePath(bucket: string, key: string) {
  const dir = await ensureDir(bucket);
  return path.join(dir, `${sanitize(key)}.json`);
}

export async function readCache<T>(bucket: string, key: string): Promise<T | null> {
  try {
    const file = await filePath(bucket, key);
    const raw = await fs.readFile(file, 'utf8');
    const payload = JSON.parse(raw) as StoredValue<T>;
    if (new Date(payload.expiresAt).getTime() <= Date.now()) {
      await fs.unlink(file).catch(() => undefined);
      return null;
    }
    return payload.value;
  } catch {
    return null;
  }
}

export async function writeCache<T>(bucket: string, key: string, value: T, ttlMs: number) {
  const file = await filePath(bucket, key);
  const payload: StoredValue<T> = {
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    value,
  };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), 'utf8');
}

export async function deleteCache(bucket: string, key: string) {
  const file = await filePath(bucket, key);
  await fs.unlink(file).catch(() => undefined);
}

export async function deleteCacheByPrefix(bucket: string, prefix: string) {
  try {
    const dir = await ensureDir(bucket);
    const files = await fs.readdir(dir);
    const sanitizedPrefix = sanitize(prefix);
    await Promise.all(
      files
        .filter((file) => file.startsWith(sanitizedPrefix))
        .map((file) => fs.unlink(path.join(dir, file)).catch(() => undefined)),
    );
  } catch {
    return;
  }
}
