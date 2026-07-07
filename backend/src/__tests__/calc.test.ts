import { calcDiscountAndTax, sumLineTotals } from '../utils/calc';

describe('calcDiscountAndTax (BR-59)', () => {
  it('computes subtotal with no discount or tax', () => {
    expect(calcDiscountAndTax({ qty: 2, rate: 100 })).toEqual({ subtotal: 200, discount: 0, tax: 0, total: 200 });
  });

  it('applies a percentage discount before tax', () => {
    const result = calcDiscountAndTax({ qty: 1, rate: 100, discountPercent: 10 });
    expect(result).toEqual({ subtotal: 100, discount: 10, tax: 0, total: 90 });
  });

  it('applies tax after discount', () => {
    const result = calcDiscountAndTax({ qty: 1, rate: 100, discountPercent: 10 }, 0.05);
    expect(result.discount).toBe(10);
    expect(result.tax).toBe(4.5);
    expect(result.total).toBe(94.5);
  });

  it('sums totals across multiple lines', () => {
    const total = sumLineTotals([
      { qty: 2, rate: 50 },
      { qty: 1, rate: 25, discountPercent: 20 }
    ]);
    expect(total).toBe(120);
  });
});
