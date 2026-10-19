import { Bike, Rental, Station } from '../domain/model';
import { applyBikeTrigger } from '../domain/stateMachine';
import { calculateRentalCost } from '../domain/pricing';
import type { MockState } from '../infrastructure/mock/seedData';
import { charge } from '../infrastructure/mock/paymentService';

export const RETURN_PARTICIPANTS = [
  'App',
  'Station',
  'Bike',
  'Rental',
  'PaymentService',
] as const;

export const RETURN_MESSAGE_SEQUENCE = [
  { id: 'm0', from: 'User', to: 'App', message: 'returnBike()' },
  { id: 'm1', from: 'App', to: 'Station', message: 'dockBike(bike)' },
  { id: 'm2', from: 'Station', to: 'Bike', message: 'lock()' },
  { id: 'm3', from: 'Station', to: 'App', message: 'docked' },
  { id: 'm4', from: 'App', to: 'Rental', message: 'end()' },
  { id: 'm5', from: 'Rental', to: 'PaymentService', message: 'charge(cost)' },
  { id: 'm6', from: 'PaymentService', to: 'Rental', message: 'paid' },
  { id: 'm7', from: 'Rental', to: 'App', message: 'cost + receipt' },
  { id: 'm8', from: 'App', to: 'User', message: 'show receipt' },
] as const;

export type ReturnMessage = (typeof RETURN_MESSAGE_SEQUENCE)[number];

export interface RentalReceipt {
  rentalId: string;
  cost: number;
}

export interface ReturnResult {
  bike: Bike;
  station: Station;
  rental: Rental;
  receipt: RentalReceipt;
  messages: ReturnMessage[];
}

/** Runs the successful return, payment, and receipt interaction in m0–m8 order. */
export function returnBike(state: MockState): ReturnResult {
  const messages: ReturnMessage[] = [];
  messages.push(RETURN_MESSAGE_SEQUENCE[0]);

  const bike = state.bikes.find((candidate) => candidate.state === 'InUse');
  const rental = state.rentals.at(-1);
  const station = state.stations[0];
  if (!bike || !rental || !station) {
    throw new Error('A rented bike, active rental, and return station are required.');
  }

  messages.push(RETURN_MESSAGE_SEQUENCE[1]);
  station.dockBike(bike);
  messages.push(RETURN_MESSAGE_SEQUENCE[2]);
  bike.lock();
  messages.push(RETURN_MESSAGE_SEQUENCE[3]);

  // The return sequence omits the state update represented by state.drawio t5.
  applyBikeTrigger(bike, 'returnToStation()');

  messages.push(RETURN_MESSAGE_SEQUENCE[4]);
  rental.end();
  rental.cost = calculateRentalCost(
    Date.parse(rental.endTime) - Date.parse(rental.startTime),
  );

  messages.push(RETURN_MESSAGE_SEQUENCE[5]);
  charge(rental.cost);
  messages.push(RETURN_MESSAGE_SEQUENCE[6]);

  const receipt = { rentalId: rental.rentalId, cost: rental.cost };
  messages.push(RETURN_MESSAGE_SEQUENCE[7]);
  messages.push(RETURN_MESSAGE_SEQUENCE[8]);

  return { bike, station, rental, receipt, messages };
}
