import fs from 'node:fs';
import { Client } from 'pg';

const importFile = process.argv[2];

if (!importFile) {
  console.error('Usage: node --env-file=.env.local scripts/import-property-texts.mjs <path-to-imports.json>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(importFile, 'utf8'));
const imports = Array.isArray(payload.imports) ? payload.imports : [];

if (imports.length === 0) {
  console.error('No property text imports found.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const timestamp = new Date().toISOString();

async function updateContentRecord(item) {
  const rawMetadata = {
    importedContentSource: 'booking-page-html',
    importedContentAt: timestamp,
    importedContentLocales: Object.entries(item.description)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([locale]) => locale),
  };

  const contentUpdate = await client.query(
    `
      update beds24_property_content
      set
        summary_summary_d_e = $2,
        summary_summary_e_n = $3,
        summary_summary_e_s = $4,
        description_description_d_e = $5,
        description_description_e_n = $6,
        description_description_e_s = $7,
        location_label_location_label_d_e = $8,
        location_label_location_label_e_n = $9,
        location_label_location_label_e_s = $10,
        last_synced_at = $11,
        updated_at = $11,
        raw = coalesce(raw, '{}'::jsonb) || $12::jsonb
      where beds24_property_id = $1
      returning id, internal_name, beds24_room_id
    `,
    [
      item.beds24PropertyId,
      item.summary.de,
      item.summary.en,
      item.summary.es,
      item.description.de,
      item.description.en,
      item.description.es,
      item.locationLabel.de,
      item.locationLabel.en,
      item.locationLabel.es,
      timestamp,
      JSON.stringify(rawMetadata),
    ],
  );

  const propertyUpdate = await client.query(
    `
      update properties
      set
        summary_summary_d_e = $2,
        summary_summary_e_n = $3,
        summary_summary_e_s = $4,
        description_description_d_e = $5,
        description_description_e_n = $6,
        description_description_e_s = $7,
        location_label_location_label_d_e = $8,
        location_label_location_label_e_n = $9,
        location_label_location_label_e_s = $10,
        seo_description_seo_description_d_e = $2,
        seo_description_seo_description_e_n = $3,
        seo_description_seo_description_e_s = $4,
        updated_at = $11
      where beds24_property_id = $1
      returning id, internal_name, beds24_room_id
    `,
    [
      item.beds24PropertyId,
      item.summary.de,
      item.summary.en,
      item.summary.es,
      item.description.de,
      item.description.en,
      item.description.es,
      item.locationLabel.de,
      item.locationLabel.en,
      item.locationLabel.es,
      timestamp,
    ],
  );

  return {
    beds24PropertyId: item.beds24PropertyId,
    beds24ContentRows: contentUpdate.rowCount,
    propertyRows: propertyUpdate.rowCount,
    locationLabel: item.locationLabel.en || item.locationLabel.de || item.locationLabel.es || '',
    summary: item.summary.en || item.summary.de || item.summary.es || '',
  };
}

try {
  await client.connect();
  const results = [];

  for (const item of imports) {
    results.push(await updateContentRecord(item));
  }

  console.log(JSON.stringify({ importedAt: timestamp, results }, null, 2));
} finally {
  await client.end().catch(() => undefined);
}
