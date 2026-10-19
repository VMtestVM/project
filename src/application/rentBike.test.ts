import { afterEach, describe, expect, it, vi } from 'vitest';
import { rentBike } from './rentBike';
import { Bike } from '../domain/model';
import { createSeededMockState } from '../infrastructure/mock/seedData';

describe('rent interaction (IT-RENT-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes and reports the successful m0–m7 sequence in order', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const state = createSeededMockState();
    const result = rentBike(state, 'bike-001');

    expect(result.messages).toEqual([
      { id: 'm0', from: 'User', to: 'App', message: 'selectBike(bikeId)' },
      { id: 'm1', from: 'App', to: 'Bike', message: 'checkAvailable()' },
      { id: 'm2', from: 'Bike', to: 'App', message: 'Available' },
      { id: 'm3', from: 'App', to: 'Station', message: 'releaseBike()' },
      { id: 'm4', from: 'Station', to: 'Bike', message: 'unlock()' },
      { id: 'm5', from: 'App', to: 'Rental', message: 'start()' },
      { id: 'm6', from: 'Rental', to: 'App', message: 'rental started' },
      { id: 'm7', from: 'App', to: 'User', message: 'unlocked, ride started' },
    ]);
    expect(result.bike.state).toBe('InUse');
    expect(result.rental.startTime).toBe('2026-01-01T00:00:00.000Z');
    expect(result.rental.endTime).toBe(result.rental.startTime);
    expect(state.rentals).toEqual([result.rental]);
  });

  it('rejects an unknown bike as an internal invalid invocation', () => {
    expect(() => rentBike(createSeededMockState(), 'unknown')).toThrow(
      'Bike unknown is not part of the seeded mock state.',
    );
  });

  it('rejects a bike that is not Available', () => {
    const state = createSeededMockState();
    const bike = state.bikes[0];
    if (!bike) {
      throw new Error('Seeded mock state must include a bike.');
    }
    bike.state = 'InUse';

    expect(() => rentBike(state, bike.bikeId)).toThrow('Bike bike-001 is not available.');
  });

  it('rejects a bike that is not held by a seeded station', () => {
    const state = createSeededMockState();
    const bike = state.bikes[0];
    if (!bike) {
      throw new Error('Seeded mock state must include a bike.');
    }
    state.stations = [];

    expect(() => rentBike(state, bike.bikeId)).toThrow(
      'Bike bike-001 is not docked at a seeded station.',
    );
  });

  it('rejects a station that releases a different bike', () => {
    const state = createSeededMockState();
    const station = state.stations[0];
    const bike = state.bikes[0];
    if (!station || !bike) {
      throw new Error('Seeded mock state must include a station and bike.');
    }
    const otherBike = new Bike('bike-002', 80);
    station.dockBike(otherBike);
    state.bikes.push(otherBike);

    expect(() => rentBike(state, otherBike.bikeId)).toThrow(
      'Station station-001 released a different bike.',
    );
  });
});
