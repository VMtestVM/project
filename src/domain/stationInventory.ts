import type { Bike, Station } from './model';

const bikesByStation = new WeakMap<Station, Bike[]>();

/** Adds a bike to a station's external aggregation collection. */
export function dockBikeAtStation(station: Station, bike: Bike): void {
  const bikes = bikesByStation.get(station) ?? [];
  if (!bikes.includes(bike)) {
    bikes.push(bike);
    bikesByStation.set(station, bikes);
  }
}

/** Releases the first docked bike, preserving the UML method's no-argument signature. */
export function releaseBikeFromStation(station: Station): Bike {
  const bike = bikesByStation.get(station)?.shift();
  if (!bike) {
    throw new Error('Cannot release a bike from a station with no docked bikes.');
  }
  return bike;
}

/** Returns a read-only snapshot for internal conformance and use-case checks. */
export function getStationBikes(station: Station): readonly Bike[] {
  return [...(bikesByStation.get(station) ?? [])];
}
