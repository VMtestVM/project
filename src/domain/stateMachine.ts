import type { Bike, BikeState } from './model';

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

export const INITIAL_BIKE_TRANSITION = {
  id: 't0',
  from: 'Initial',
  to: 'Available',
} as const;

interface BikeStateTransitionDefinition {
  id: 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8';
  from: BikeState;
  to: BikeState;
  trigger: BikeTrigger;
  detail?: string;
  guard?: string;
}

export const BIKE_STATE_TRANSITIONS = [
  { id: 't1', from: 'Available', to: 'Reserved', trigger: 'reserve()' },
  {
    id: 't2',
    from: 'Reserved',
    to: 'Available',
    trigger: 'timeout',
    detail: 'after 10 minutes',
  },
  { id: 't2', from: 'Reserved', to: 'Available', trigger: 'cancel()' },
  { id: 't3', from: 'Reserved', to: 'InUse', trigger: 'unlock()' },
  { id: 't4', from: 'Available', to: 'InUse', trigger: 'unlock()' },
  { id: 't5', from: 'InUse', to: 'Available', trigger: 'returnToStation()' },
  { id: 't6', from: 'InUse', to: 'Maintenance', trigger: 'reportFault()' },
  {
    id: 't7',
    from: 'Available',
    to: 'Maintenance',
    trigger: 'batteryLow()',
    guard: 'batteryLevel <= 20',
  },
  { id: 't8', from: 'Maintenance', to: 'Available', trigger: 'repaired()' },
] as const satisfies readonly BikeStateTransitionDefinition[];

const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000;
const LOW_BATTERY_THRESHOLD = 20;
const reservationTimers = new WeakMap<Bike, ReturnType<typeof setTimeout>>();

/** Applies one modeled trigger to a Bike without adding state or class members. */
export function applyBikeTrigger(bike: Bike, trigger: BikeTrigger): void {
  switch (trigger) {
    case 'reserve()':
      applyTransition(bike, 't1', trigger);
      scheduleReservationTimeout(bike);
      return;
    case 'timeout':
    case 'cancel()':
      applyTransition(bike, 't2', trigger);
      clearReservationTimeout(bike);
      return;
    case 'unlock()':
      if (bike.state === 'Available') {
        applyTransition(bike, 't4', trigger);
        clearReservationTimeout(bike);
        return;
      }
      if (bike.state === 'Reserved') {
        applyTransition(bike, 't3', trigger);
        clearReservationTimeout(bike);
        return;
      }
      throw unsupportedTrigger(trigger, bike.state);
    case 'returnToStation()':
      applyTransition(bike, 't5', trigger);
      return;
    case 'reportFault()':
      applyTransition(bike, 't6', trigger);
      return;
    case 'batteryLow()':
      if (bike.batteryLevel > LOW_BATTERY_THRESHOLD) {
        requireBikeState(bike, 'Available', trigger);
        return;
      }
      applyTransition(bike, 't7', trigger);
      return;
    case 'repaired()':
      applyTransition(bike, 't8', trigger);
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

function applyTransition(
  bike: Bike,
  transitionId: BikeStateTransitionDefinition['id'],
  trigger: BikeTrigger,
): void {
  const transition = BIKE_STATE_TRANSITIONS.find(
    (candidate) => candidate.id === transitionId && candidate.trigger === trigger,
  );
  if (!transition) {
    throw new Error(`No Bike transition ${transitionId} is defined for ${trigger}.`);
  }
  requireBikeState(bike, transition.from, trigger);
  bike.state = transition.to;
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
