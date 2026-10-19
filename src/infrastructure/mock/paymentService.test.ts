import { describe, expect, it } from 'vitest';
import { charge } from './paymentService';

describe('mock payment boundary (IT-PAYMENT-01)', () => {
  it.each([0, 1, 1.15, 15.25])(
    'returns the modeled success response for EUR %s',
    (cost) => {
      expect(charge(cost)).toBe('paid');
    },
  );

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid payment amount %s as an internal input error',
    (cost) => {
      expect(() => charge(cost)).toThrow(
        'Payment amount must be a finite, non-negative number.',
      );
    },
  );
});
