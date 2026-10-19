import type { Bike } from './model';

/** Triggers named by the Bike state diagram. */
export type BikeTrigger =
  | 'reserve()'
  | 'timeout'
  | 'cancel()'
  | 'unlock()'
  | 'returnToStation()'
  | 'reportFault()'
  | 'batteryLow()'
  | 'repaired()';

const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000;
const LOW_BATTERY_THRESHOLD = 20;
const reservationTimers = new WeakMap<Bike, ReturnType<typeof setTimeout>>();

/** Applies one modeled trigger to a Bike without adding state or class members. */
export function applyBikeTrigger(bike: Bike, trigger: BikeTrigger): void {
  switch (trigger) {
    case 'reserve()':
      requireBikeState(bike, 'Available', trigger);
      bike.state = 'Reserved';
      scheduleReservationTimeout(bike);
      return;
    case 'timeout':
    case 'cancel()':
      requireBikeState(bike, 'Reserved', trigger);
      clearReservationTimeout(bike);
      bike.state = 'Available';
      return;
    case 'unlock()':
      if (bike.state === 'Available' || bike.state === 'Reserved') {
        clearReservationTimeout(bike);
        bike.state = 'InUse';
        return;
      }
      throw unsupportedTrigger(trigger, bike.state);
    case 'returnToStation()':
      requireBikeState(bike, 'InUse', trigger);
      bike.state = 'Available';
      return;
    case 'reportFault()':
      requireBikeState(bike, 'InUse', trigger);
      bike.state = 'Maintenance';
      return;
    case 'batteryLow()':
      requireBikeState(bike, 'Available', trigger);
      if (bike.batteryLevel <= LOW_BATTERY_THRESHOLD) {
        bike.state = 'Maintenance';
      }
      return;
    case 'repaired()':
      requireBikeState(bike, 'Maintenance', trigger);
      bike.state = 'Available';
      return;
    default:
      return assertNever(trigger);
  }
}

function requireBikeState(
  bike: Bike,
  expectedState: Bike['state'],
  trigger: BikeTrigger,
): void {
  if (bike.state !== expectedState) {
    throw unsupportedTrigger(trigger, bike.state);
  }
}

function unsupportedTrigger(trigger: BikeTrigger, state: Bike['state']): Error {
  return new Error(`Trigger ${trigger} is not supported from Bike state ${state}.`);
}

function scheduleReservationTimeout(bike: Bike): void {
  clearReservationTimeout(bike);
  const timer = setTimeout(() => {
    if (bike.state === 'Reserved') {
      applyBikeTrigger(bike, 'timeout');
    }
  }, RESERVATION_TIMEOUT_MS);
  reservationTimers.set(bike, timer);
}

function clearReservationTimeout(bike: Bike): void {
  const timer = reservationTimers.get(bike);
  if (timer !== undefined) {
    clearTimeout(timer);
    reservationTimers.delete(bike);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unknown Bike trigger: ${String(value)}.`);
}
