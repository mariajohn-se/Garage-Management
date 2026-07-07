export interface LineAmount {
  qty: number;
  rate: number;
  discountPercent?: number;
}

/**
 * BR-59: discount/tax must use a single company formula, validated/unit-tested.
 * No documented tax rate exists anywhere in the spec files (no VAT/tax % found in
 * DB_CONNECTION_SPEC_v12.md or STANDARDS.md), so tax defaults to 0 here - callers can pass a
 * rate once the business confirms one exists.
 */
export function calcDiscountAndTax(
  line: LineAmount,
  taxRate = 0
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = round2(line.qty * line.rate);
  const discount = round2((subtotal * (line.discountPercent ?? 0)) / 100);
  const afterDiscount = subtotal - discount;
  const tax = round2(afterDiscount * taxRate);
  const total = round2(afterDiscount + tax);
  return { subtotal, discount, tax, total };
}

export function sumLineTotals(lines: LineAmount[], taxRate = 0): number {
  return round2(lines.reduce((sum, line) => sum + calcDiscountAndTax(line, taxRate).total, 0));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
