import { describe, expect, expectTypeOf, it } from 'vitest';
import { Bike, domainRelationships, Rental, Station, User } from './model';

describe('domain model conformance (UT-MODEL-01)', () => {
  it('exposes exactly the four diagram classes with their declared attributes', () => {
    const user = new User('u1', 'Rider', 'card');
    const rental = new Rental('r1', '2026-01-01T00:00:00Z', '2026-01-01T01:00:00Z', 1);
    const station = new Station('s1', 12);
    const bike = new Bike('b1', 80, 'Available');

    expect([user, rental, station, bike].map((value) => value.constructor.name)).toEqual([
      'User',
      'Rental',
      'Station',
      'Bike',
    ]);
    expect(Object.keys(user)).toEqual(['userId', 'name', 'paymentMethod']);
    expect(Object.keys(rental)).toEqual(['rentalId', 'startTime', 'endTime', 'cost']);
    expect(Object.keys(station)).toEqual(['stationId', 'capacity']);
    expect(Object.keys(bike)).toEqual(['bikeId', 'batteryLevel', 'state']);
  });

  it('preserves the declared attribute and method types', () => {
    expectTypeOf<User['userId']>().toEqualTypeOf<string>();
    expectTypeOf<User['name']>().toEqualTypeOf<string>();
    expectTypeOf<User['paymentMethod']>().toEqualTypeOf<string>();
    expectTypeOf<Rental['rentalId']>().toEqualTypeOf<string>();
    expectTypeOf<Rental['startTime']>().toEqualTypeOf<string>();
    expectTypeOf<Rental['endTime']>().toEqualTypeOf<string>();
    expectTypeOf<Rental['cost']>().toEqualTypeOf<number>();
    expectTypeOf<Rental['start']>().toEqualTypeOf<() => void>();
    expectTypeOf<Rental['end']>().toEqualTypeOf<() => void>();
    expectTypeOf<Station['stationId']>().toEqualTypeOf<string>();
    expectTypeOf<Station['capacity']>().toEqualTypeOf<number>();
    expectTypeOf<Station['dockBike']>().toEqualTypeOf<(bike: Bike) => void>();
    expectTypeOf<Station['releaseBike']>().toEqualTypeOf<() => Bike>();
    expectTypeOf<Bike['bikeId']>().toEqualTypeOf<string>();
    expectTypeOf<Bike['batteryLevel']>().toEqualTypeOf<number>();
    expectTypeOf<Bike['state']>().toEqualTypeOf<
      'Available' | 'Reserved' | 'InUse' | 'Maintenance'
    >();
    expectTypeOf<Bike['lock']>().toEqualTypeOf<() => void>();
    expectTypeOf<Bike['unlock']>().toEqualTypeOf<() => void>();
  });

  it('reports operations that await their behavior phase instead of succeeding silently', () => {
    const rental = new Rental('r1', '2026-01-01T00:00:00Z', '', 0);
    const station = new Station('s1', 12);
    const bike = new Bike('b1', 80, 'Available');

    expect(() => rental.start()).toThrow(
      'Rental.start() behavior is not implemented yet.',
    );
    expect(() => rental.end()).toThrow('Rental.end() behavior is not implemented yet.');
    expect(() => station.dockBike(bike)).toThrow(
      'Station.dockBike() behavior is not implemented yet.',
    );
    expect(() => station.releaseBike()).toThrow(
      'Station.releaseBike() behavior is not implemented yet.',
    );
    expect(() => bike.lock()).toThrow('Bike.lock() behavior is not implemented yet.');
    expect(() => bike.unlock()).toThrow('Bike.unlock() behavior is not implemented yet.');
  });

  it('represents e1-e3 ends, multiplicities, and e3 aggregation with source cells', () => {
    expect(domainRelationships).toEqual([
      {
        id: 'e1',
        source: 'User',
        target: 'Rental',
        label: 'makes',
        sourceMultiplicity: '1',
        targetMultiplicity: '0..*',
        kind: 'association',
        sourceCells: ['e1', 'e1_a', 'e1_b'],
      },
      {
        id: 'e2',
        source: 'Rental',
        target: 'Bike',
        label: 'uses',
        sourceMultiplicity: '*',
        targetMultiplicity: '1',
        kind: 'association',
        sourceCells: ['e2', 'e2_a', 'e2_b'],
      },
      {
        id: 'e3',
        source: 'Station',
        target: 'Bike',
        label: 'holds',
        sourceMultiplicity: '1',
        targetMultiplicity: '0..*',
        kind: 'aggregation',
        diamond: 'hollow',
        sourceCells: ['e3', 'e3_a', 'e3_b'],
      },
    ]);
  });
});
