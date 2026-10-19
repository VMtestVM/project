import { Bike, Rental, Station, User } from '../../domain/model';

/** In-memory mock data; relationship collections stay outside UML model classes. */
export interface MockState {
  users: User[];
  stations: Station[];
  bikes: Bike[];
  rentals: Rental[];
  stationBikes: Map<Station, Bike[]>;
}

/** Creates fresh seed records so reinitialization restores the mock baseline. */
export function createSeededMockState(): MockState {
  const user = new User('user-001', 'Demo Rider', 'mock-payment');
  const station = new Station('station-001', 10);
  const bike = new Bike('bike-001', 80);

  return {
    users: [user],
    stations: [station],
    bikes: [bike],
    rentals: [],
    stationBikes: new Map([[station, [bike]]]),
  };
}
