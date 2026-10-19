import { describe, expect, it } from 'vitest';
import { Bike, Station } from './model';
import {
  dockBikeAtStation,
  getStationBikes,
  releaseBikeFromStation,
} from './stationInventory';

describe('Station–Bike aggregation (class.drawio e3)', () => {
  it('keeps each bike once in the external station inventory', () => {
    const station = new Station('s1', 10);
    const bike = new Bike('b1', 80);

    dockBikeAtStation(station, bike);
    dockBikeAtStation(station, bike);

    expect(getStationBikes(station)).toEqual([bike]);
  });

  it('releases a docked bike and reports an empty station internally', () => {
    const station = new Station('s1', 10);
    const bike = new Bike('b1', 80);
    station.dockBike(bike);

    expect(station.releaseBike()).toBe(bike);
    expect(getStationBikes(station)).toEqual([]);
    expect(() => releaseBikeFromStation(station)).toThrow(
      'Cannot release a bike from a station with no docked bikes.',
    );
  });
});
