import type { CollectionConfig } from 'payload';

export const Vouchers: CollectionConfig = {
  slug: 'vouchers',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'active', 'validFrom', 'validTo', 'currentUses', 'maxUses'],
    description: 'Voucher / discount codes. Applied at checkout and sent to Beds24 as infoItem + comment.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.code && typeof data.code === 'string') {
          data.code = data.code.trim().toUpperCase();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Customer-facing code (stored uppercase). Example: SUMMER25, XMAS2026.',
      },
    },
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Internal label shown in admin lists.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'percent',
      options: [
        { label: 'Percent off subtotal', value: 'percent' },
        { label: 'Absolute amount (EUR)', value: 'absolute' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'For percent: 0-100 (e.g. 10 = 10%). For absolute: EUR amount (e.g. 50 = €50 off).',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'validFrom',
      type: 'date',
      admin: {
        description: 'Optional. Voucher is invalid before this date.',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'validTo',
      type: 'date',
      admin: {
        description: 'Optional. Voucher is invalid after this date.',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional. Total number of redemptions allowed. Leave empty for unlimited.',
      },
    },
    {
      name: 'currentUses',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Auto-incremented on successful booking. Do not edit manually.',
      },
    },
    {
      name: 'minNights',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional. Minimum nights required for the stay to qualify.',
      },
    },
    {
      name: 'minSubtotal',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional. Minimum subtotal (EUR) required for the voucher to apply.',
      },
    },
    {
      name: 'propertyScope',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All properties', value: 'all' },
        { label: 'Specific properties', value: 'specific' },
      ],
    },
    {
      name: 'properties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      admin: {
        condition: (data) => data?.propertyScope === 'specific',
        description: 'Only applies to the selected properties.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not shown to guests).',
      },
    },
  ],
};
