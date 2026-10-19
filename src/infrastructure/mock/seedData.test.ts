import { describe, expect, it } from 'vitest';
import { Bike, Station, User } from '../../domain/model';
import { getStationBikes } from '../../domain/stationInventory';
import { createSeededMockState } from './seedData';

describe('seeded mock state (IT-SEED-01)', () => {
  it('provides a demo user, station, rentable bike, and station-bike relationship', () => {
    const state = createSeededMockState();
    const user = state.users[0];
    const station = state.stations[0];
    const bike = state.bikes[0];

    expect(state.users).toHaveLength(1);
    expect(state.stations).toHaveLength(1);
    expect(state.bikes).toHaveLength(1);
    if (!user || !station || !bike) {
      throw new Error('Seeded mock state must include a user, station, and bike.');
    }

    expect(user).toBeInstanceOf(User);
    expect(station).toBeInstanceOf(Station);
    expect(bike).toBeInstanceOf(Bike);
    expect(bike.state).toBe('Available');
    expect(bike.batteryLevel).toBeGreaterThan(20);
    expect(getStationBikes(station)).toEqual([bike]);
    expect(state.rentals).toEqual([]);
  });

  it('returns independent seed records when the mock state is reinitialized', () => {
    const firstState = createSeededMockState();
    const firstUser = firstState.users[0];
    const firstStation = firstState.stations[0];
    const firstBike = firstState.bikes[0];
    if (!firstUser || !firstStation || !firstBike) {
      throw new Error('Seeded mock state must include a user, station, and bike.');
    }
    firstUser.name = 'Changed Rider';
    firstBike.state = 'InUse';
    firstStation.releaseBike();

    const resetState = createSeededMockState();
    const resetUser = resetState.users[0];
    const resetStation = resetState.stations[0];
    const resetBike = resetState.bikes[0];
    if (!resetUser || !resetStation || !resetBike) {
      throw new Error('Seeded mock state must include a user, station, and bike.');
    }

    expect(resetUser.name).toBe('Demo Rider');
    expect(resetBike.state).toBe('Available');
    expect(getStationBikes(resetStation)).toEqual([resetBike]);
    expect(resetUser).not.toBe(firstUser);
    expect(resetBike).not.toBe(firstBike);
  });
});
