import { getStationBikes } from '../domain/stationInventory';
import { Bike, Rental } from '../domain/model';
import type { MockState } from '../infrastructure/mock/seedData';

export const RENT_PARTICIPANTS = ['App', 'Station', 'Bike', 'Rental'] as const;

export const RENT_MESSAGE_SEQUENCE = [
  { id: 'm0', from: 'User', to: 'App', message: 'selectBike(bikeId)' },
  { id: 'm1', from: 'App', to: 'Bike', message: 'checkAvailable()' },
  { id: 'm2', from: 'Bike', to: 'App', message: 'Available' },
  { id: 'm3', from: 'App', to: 'Station', message: 'releaseBike()' },
  { id: 'm4', from: 'Station', to: 'Bike', message: 'unlock()' },
  { id: 'm5', from: 'App', to: 'Rental', message: 'start()' },
  { id: 'm6', from: 'Rental', to: 'App', message: 'rental started' },
  { id: 'm7', from: 'App', to: 'User', message: 'unlocked, ride started' },
] as const;

export type RentMessage = (typeof RENT_MESSAGE_SEQUENCE)[number];

export interface RentResult {
  bike: Bike;
  rental: Rental;
  messages: RentMessage[];
}

/** Runs the successful rent interaction in the order specified by m0–m7. */
export function rentBike(state: MockState, bikeId: string): RentResult {
  const messages: RentMessage[] = [];
  messages.push(RENT_MESSAGE_SEQUENCE[0]);

  const bike = state.bikes.find((candidate) => candidate.bikeId === bikeId);
  if (!bike) {
    throw new Error(`Bike ${bikeId} is not part of the seeded mock state.`);
  }
  messages.push(RENT_MESSAGE_SEQUENCE[1]);

  if (bike.state !== 'Available') {
    throw new Error(`Bike ${bikeId} is not available.`);
  }
  messages.push(RENT_MESSAGE_SEQUENCE[2]);

  const station = state.stations.find((candidate) =>
    getStationBikes(candidate).includes(bike),
  );
  if (!station) {
    throw new Error(`Bike ${bikeId} is not docked at a seeded station.`);
  }
  messages.push(RENT_MESSAGE_SEQUENCE[3]);
  const releasedBike = station.releaseBike();
  if (releasedBike !== bike) {
    throw new Error(`Station ${station.stationId} released a different bike.`);
  }

  messages.push(RENT_MESSAGE_SEQUENCE[4]);
  bike.unlock();

  const rental = new Rental(
    `rental-${String(state.rentals.length + 1).padStart(3, '0')}`,
    '',
    '',
    0,
  );
  messages.push(RENT_MESSAGE_SEQUENCE[5]);
  rental.start();
  state.rentals.push(rental);
  messages.push(RENT_MESSAGE_SEQUENCE[6]);
  messages.push(RENT_MESSAGE_SEQUENCE[7]);

  return { bike, rental, messages };
}
