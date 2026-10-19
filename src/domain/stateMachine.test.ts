import { afterEach, describe, expect, it, vi } from 'vitest';
import { Bike } from './model';
import { applyBikeTrigger } from './stateMachine';

describe('Bike state machine (UT-STATE-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in Available through the initial transition t0', () => {
    expect(new Bike('b1', 80).state).toBe('Available');
  });

  it('applies t1 from Available to Reserved on reserve()', () => {
    vi.useFakeTimers();
    const bike = new Bike('b1', 80);

    applyBikeTrigger(bike, 'reserve()');

    expect(bike.state).toBe('Reserved');
    applyBikeTrigger(bike, 'cancel()');
  });

  it('applies t2 timeout at the 10-minute boundary', () => {
    vi.useFakeTimers();
    const bike = new Bike('b1', 80);
    applyBikeTrigger(bike, 'reserve()');

    vi.advanceTimersByTime(599_999);
    expect(bike.state).toBe('Reserved');

    vi.advanceTimersByTime(1);
    expect(bike.state).toBe('Available');
  });

  it('applies t2 cancellation immediately and clears the timeout', () => {
    vi.useFakeTimers();
    const bike = new Bike('b1', 80);
    applyBikeTrigger(bike, 'reserve()');

    applyBikeTrigger(bike, 'cancel()');
    vi.advanceTimersByTime(600_000);

    expect(bike.state).toBe('Available');
  });

  it('applies t3 and t4 through unlock() from Reserved and Available', () => {
    const reservedBike = new Bike('b1', 80);
    applyBikeTrigger(reservedBike, 'reserve()');
    reservedBike.unlock();

    const availableBike = new Bike('b2', 80);
    availableBike.unlock();

    expect(reservedBike.state).toBe('InUse');
    expect(availableBike.state).toBe('InUse');
  });

  it('applies t5 returnToStation() from InUse to Available', () => {
    const bike = new Bike('b1', 80);
    bike.unlock();

    applyBikeTrigger(bike, 'returnToStation()');

    expect(bike.state).toBe('Available');
  });

  it('applies t6 reportFault() from InUse to Maintenance', () => {
    const bike = new Bike('b1', 80);
    bike.unlock();

    applyBikeTrigger(bike, 'reportFault()');

    expect(bike.state).toBe('Maintenance');
  });

  it('applies t7 at or below 20% and leaves state unchanged above the guard', () => {
    const lowBatteryBike = new Bike('b1', 20);
    const aboveThresholdBike = new Bike('b2', 21);

    applyBikeTrigger(lowBatteryBike, 'batteryLow()');
    applyBikeTrigger(aboveThresholdBike, 'batteryLow()');

    expect(lowBatteryBike.state).toBe('Maintenance');
    expect(aboveThresholdBike.state).toBe('Available');
  });

  it('applies t8 without resetting the battery level', () => {
    const bike = new Bike('b1', 10);
    applyBikeTrigger(bike, 'batteryLow()');

    applyBikeTrigger(bike, 'repaired()');

    expect(bike.state).toBe('Available');
    expect(bike.batteryLevel).toBe(10);
  });

  it('rejects unsupported triggers internally without changing state', () => {
    const bike = new Bike('b1', 80);

    expect(() => applyBikeTrigger(bike, 'cancel()')).toThrow(
      'Trigger cancel() is not supported from Bike state Available.',
    );
    expect(bike.state).toBe('Available');
  });

  it.each([-1, 101, 10.5])(
    'rejects battery level %s because battery is an integer percentage from 0 to 100',
    (batteryLevel) => {
      expect(() => new Bike('b1', batteryLevel)).toThrow(
        'Bike battery level must be an integer from 0 to 100.',
      );
    },
  );

  it.each([0, 100])('accepts battery boundary value %s', (batteryLevel) => {
    expect(new Bike('b1', batteryLevel).batteryLevel).toBe(batteryLevel);
  });
});
