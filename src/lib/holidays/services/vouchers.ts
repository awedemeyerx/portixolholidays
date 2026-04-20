import { getPayloadClient } from '@/lib/payload';
import type { AppliedVoucher, PriceBreakdown, VoucherRecord, VoucherType } from '../types';

export type VoucherValidationError =
  | 'not_found'
  | 'inactive'
  | 'not_yet_valid'
  | 'expired'
  | 'max_uses_reached'
  | 'min_nights_not_met'
  | 'min_subtotal_not_met'
  | 'property_not_eligible';

export type VoucherValidationResult =
  | { ok: true; voucher: VoucherRecord }
  | { ok: false; reason: VoucherValidationError };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapVoucher(doc: Record<string, unknown>): VoucherRecord {
  const relations = Array.isArray(doc.properties) ? doc.properties : [];
  const propertyIds = relations
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        const id = (entry as Record<string, unknown>).id;
        return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
      }
      return '';
    })
    .filter(Boolean);

  return {
    id: String(doc.id ?? ''),
    code: String(doc.code ?? '').toUpperCase(),
    label: typeof doc.label === 'string' ? doc.label : undefined,
    type: (doc.type === 'absolute' ? 'absolute' : 'percent') as VoucherType,
    value: Number(doc.value ?? 0),
    active: Boolean(doc.active),
    validFrom: typeof doc.validFrom === 'string' ? doc.validFrom : undefined,
    validTo: typeof doc.validTo === 'string' ? doc.validTo : undefined,
    maxUses: doc.maxUses == null ? undefined : Number(doc.maxUses),
    currentUses: Number(doc.currentUses ?? 0),
    minNights: doc.minNights == null ? undefined : Number(doc.minNights),
    minSubtotal: doc.minSubtotal == null ? undefined : Number(doc.minSubtotal),
    propertyScope: doc.propertyScope === 'specific' ? 'specific' : 'all',
    propertyIds,
  };
}

export async function findVoucherByCode(code: string): Promise<VoucherRecord | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;

  const payload = await getPayloadClient();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: 'vouchers',
      where: { code: { equals: trimmed } },
      limit: 1,
      depth: 0,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return mapVoucher(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export type ValidateVoucherInput = {
  code: string;
  propertyId: string;
  nights: number;
  subtotal: number;
  checkIn: string;
};

export async function validateVoucher(input: ValidateVoucherInput): Promise<VoucherValidationResult> {
  const voucher = await findVoucherByCode(input.code);
  if (!voucher) return { ok: false, reason: 'not_found' };
  if (!voucher.active) return { ok: false, reason: 'inactive' };

  const refDate = new Date(`${input.checkIn}T00:00:00Z`).getTime();
  if (voucher.validFrom) {
    const from = new Date(voucher.validFrom).getTime();
    if (Number.isFinite(from) && refDate < from) return { ok: false, reason: 'not_yet_valid' };
  }
  if (voucher.validTo) {
    const to = new Date(voucher.validTo).getTime();
    if (Number.isFinite(to) && refDate > to) return { ok: false, reason: 'expired' };
  }

  if (voucher.maxUses != null && voucher.currentUses >= voucher.maxUses) {
    return { ok: false, reason: 'max_uses_reached' };
  }

  if (voucher.minNights != null && input.nights < voucher.minNights) {
    return { ok: false, reason: 'min_nights_not_met' };
  }

  if (voucher.minSubtotal != null && input.subtotal < voucher.minSubtotal) {
    return { ok: false, reason: 'min_subtotal_not_met' };
  }

  if (voucher.propertyScope === 'specific' && !voucher.propertyIds.includes(input.propertyId)) {
    return { ok: false, reason: 'property_not_eligible' };
  }

  return { ok: true, voucher };
}

export function computeDiscount(voucher: VoucherRecord, subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (voucher.type === 'percent') {
    const pct = Math.min(Math.max(voucher.value, 0), 100);
    return roundMoney((subtotal * pct) / 100);
  }
  return roundMoney(Math.min(Math.max(voucher.value, 0), subtotal));
}

export function applyVoucherToBreakdown(
  breakdown: PriceBreakdown,
  voucher: VoucherRecord,
  depositRate: number,
): { breakdown: PriceBreakdown; applied: AppliedVoucher } {
  const discount = computeDiscount(voucher, breakdown.subtotal);
  const newSubtotal = roundMoney(Math.max(breakdown.subtotal - discount, 0));
  const newTotal = roundMoney(Math.max(breakdown.totalPrice - discount, 0));
  const newDeposit = roundMoney(newTotal * depositRate);

  const applied: AppliedVoucher = {
    id: voucher.id,
    code: voucher.code,
    type: voucher.type,
    value: voucher.value,
    discountAmount: discount,
  };

  return {
    breakdown: {
      ...breakdown,
      subtotal: newSubtotal,
      totalPrice: newTotal,
      depositAmount: newDeposit,
      discountAmount: discount,
      voucher: applied,
    },
    applied,
  };
}

export async function incrementVoucherUsage(voucherId: string): Promise<void> {
  const payload = await getPayloadClient();
  if (!payload) return;

  try {
    const existing = (await payload.findByID({
      collection: 'vouchers',
      id: voucherId,
      depth: 0,
    })) as Record<string, unknown> | null;
    const current = Number(existing?.currentUses ?? 0);
    await payload.update({
      collection: 'vouchers',
      id: voucherId,
      data: { currentUses: current + 1 },
    });
  } catch {
    // swallow — voucher accounting is best-effort
  }
}
