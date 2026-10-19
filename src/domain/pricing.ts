const UNLOCK_FEE_CENTS = 100;
const PRICE_PER_STARTED_MINUTE_CENTS = 15;
const MILLISECONDS_PER_MINUTE = 60_000;

/** Calculates EUR 1.00 plus EUR 0.15 per started positive minute. */
export function calculateRentalCost(durationMilliseconds: number): number {
  if (!Number.isFinite(durationMilliseconds) || durationMilliseconds < 0) {
    throw new RangeError('Rental duration must be a finite, non-negative number.');
  }

  const startedMinutes = Math.ceil(durationMilliseconds / MILLISECONDS_PER_MINUTE);
  const totalCents = UNLOCK_FEE_CENTS + startedMinutes * PRICE_PER_STARTED_MINUTE_CENTS;
  return totalCents / 100;
}
