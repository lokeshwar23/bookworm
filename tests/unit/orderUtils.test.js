// tests/unit/orderUtils.test.js
import { computeTotals } from '../../lib/orderUtils.js';

describe('computeTotals', () => {
  const items = [
    { price: '299.00', quantity: 1 },
    { price: '149.00', quantity: 2 },
  ];

  test('computes subtotal correctly', () => {
    const result = computeTotals(items, 0);
    expect(result.subtotal).toBe(597);
  });

  test('tax is 12% of subtotal', () => {
    const result = computeTotals(items, 0);
    expect(result.tax).toBe(parseFloat((597 * 0.12).toFixed(2)));
  });

  test('free delivery when subtotal >= 500', () => {
    const result = computeTotals(items, 0);
    expect(result.deliveryCharge).toBe(0);
  });

  test('delivery charge ₹50 when subtotal < 500', () => {
    const smallItems = [{ price: '99.00', quantity: 1 }];
    const result = computeTotals(smallItems, 0);
    expect(result.deliveryCharge).toBe(50);
  });

  test('gift points discount is applied', () => {
    const result = computeTotals(items, 50);
    expect(result.giftPointsUsed).toBe(50);
    const expected = 597 + parseFloat((597 * 0.12).toFixed(2)) + 0 - 50;
    expect(result.total).toBeCloseTo(expected, 2);
  });

  test('gift points capped at order total', () => {
    const result = computeTotals(items, 99999);
    const maxTotal = 597 + parseFloat((597 * 0.12).toFixed(2));
    expect(result.giftPointsUsed).toBe(Math.floor(maxTotal));
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});
