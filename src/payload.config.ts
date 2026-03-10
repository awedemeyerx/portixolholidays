import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import path from 'path';
import { fileURLToPath } from 'url';
import { Beds24PropertyContent } from './collections/Beds24PropertyContent';
import { Beds24InventorySnapshots } from './collections/Beds24InventorySnapshots';
import { FAQEntries } from './collections/FAQEntries';
import { LegalPages } from './collections/LegalPages';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Properties } from './collections/Properties';
import { Users } from './collections/Users';
import { SiteSettings } from './globals/SiteSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Properties, Beds24PropertyContent, Beds24InventorySnapshots, Pages, FAQEntries, LegalPages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'portixol-holidays-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
});
