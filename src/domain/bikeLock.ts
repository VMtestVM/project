import type { Bike } from './model';

const lockedBikes = new WeakSet<Bike>();

/** Records the modeled Bike.lock() operation without adding a UML attribute. */
export function lockBike(bike: Bike): void {
  lockedBikes.add(bike);
}

/** Records the modeled Bike.unlock() operation without adding a UML attribute. */
export function unlockBike(bike: Bike): void {
  lockedBikes.delete(bike);
}

/** Reports lock state to internal flow tests without changing the UML model. */
export function isBikeLocked(bike: Bike): boolean {
  return lockedBikes.has(bike);
}
