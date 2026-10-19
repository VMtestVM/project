import { afterEach, describe, expect, it, vi } from 'vitest';
import { rentBike } from './rentBike';
import { returnBike } from './returnBike';
import { getStationBikes } from '../domain/stationInventory';
import { createSeededMockState } from '../infrastructure/mock/seedData';

describe('return interaction (IT-RETURN-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes m0–m8 in order, records t5, charges, and returns a receipt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const state = createSeededMockState();
    const rent = rentBike(state, 'bike-001');
    vi.setSystemTime(new Date('2026-01-01T00:01:01.000Z'));

    const result = returnBike(state);

    expect(result.messages).toEqual([
      { id: 'm0', from: 'User', to: 'App', message: 'returnBike()' },
      { id: 'm1', from: 'App', to: 'Station', message: 'dockBike(bike)' },
      { id: 'm2', from: 'Station', to: 'Bike', message: 'lock()' },
      { id: 'm3', from: 'Station', to: 'App', message: 'docked' },
      { id: 'm4', from: 'App', to: 'Rental', message: 'end()' },
      { id: 'm5', from: 'Rental', to: 'PaymentService', message: 'charge(cost)' },
      { id: 'm6', from: 'PaymentService', to: 'Rental', message: 'paid' },
      { id: 'm7', from: 'Rental', to: 'App', message: 'cost + receipt' },
      { id: 'm8', from: 'App', to: 'User', message: 'show receipt' },
    ]);
    expect(result.messages.map(({ id }) => id)).toEqual([
      'm0',
      'm1',
      'm2',
      'm3',
      'm4',
      'm5',
      'm6',
      'm7',
      'm8',
    ]);
    expect(rent.bike.state).toBe('Available');
    expect(result.bike.state).toBe('Available');
    expect(result.rental.endTime).toBe('2026-01-01T00:01:01.000Z');
    expect(result.rental.cost).toBe(1.3);
    expect(result.receipt).toEqual({ rentalId: 'rental-001', cost: 1.3 });
    expect(getStationBikes(result.station)).toEqual([result.bike]);
  });

  it('charges the unlock fee when rent and return are in the same instant', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const state = createSeededMockState();
    rentBike(state, 'bike-001');

    expect(returnBike(state).rental.cost).toBe(1);
  });

  it('uses the configured started-minute pricing for a partial minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const state = createSeededMockState();
    rentBike(state, 'bike-001');
    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));

    expect(returnBike(state).rental.cost).toBe(1.15);
  });

  it.each([
    ['bike', (state: ReturnType<typeof createSeededMockState>) => (state.bikes = [])],
    ['rental', (state: ReturnType<typeof createSeededMockState>) => (state.rentals = [])],
    [
      'station',
      (state: ReturnType<typeof createSeededMockState>) => (state.stations = []),
    ],
  ])('rejects a return when the %s context is missing', (_name, removeContext) => {
    const state = createSeededMockState();
    removeContext(state);

    expect(() => returnBike(state)).toThrow(
      'A rented bike, active rental, and return station are required.',
    );
  });
});
