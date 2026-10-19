import { describe, expect, it } from 'vitest';
import { calculateRentalCost } from './pricing';

describe('rental pricing (UT-PRICE-01)', () => {
  it.each([
    [0, 1],
    [1, 1.15],
    [30_000, 1.15],
    [60_000, 1.15],
    [60_001, 1.3],
    [120_000, 1.3],
  ])('calculates %s milliseconds as EUR %s', (durationMilliseconds, expectedCost) => {
    expect(calculateRentalCost(durationMilliseconds)).toBe(expectedCost);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid rental duration %s',
    (durationMilliseconds) => {
      expect(() => calculateRentalCost(durationMilliseconds)).toThrow(
        'Rental duration must be a finite, non-negative number.',
      );
    },
  );
});
