/** Successful-only response from the sequence participant PaymentService. */
export type PaymentResult = 'paid';

/** Records no credentials or transaction data; returns the modeled success response. */
export function charge(cost: number): PaymentResult {
  if (!Number.isFinite(cost) || cost < 0) {
    throw new RangeError('Payment amount must be a finite, non-negative number.');
  }

  return 'paid';
}
