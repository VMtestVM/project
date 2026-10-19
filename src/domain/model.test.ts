import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { isBikeLocked } from './bikeLock';
import { Bike, domainRelationships, Rental, Station, User } from './model';

describe('domain model conformance (UT-MODEL-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes exactly the four diagram classes with their declared attributes', () => {
    const user = new User('u1', 'Rider', 'card');
    const rental = new Rental('r1', '2026-01-01T00:00:00Z', '2026-01-01T01:00:00Z', 1);
    const station = new Station('s1', 12);
    const bike = new Bike('b1', 80);

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

  it('records rental start and end as ISO UTC timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const rental = new Rental('r1', '', '', 0);

    rental.start();
    expect(rental.startTime).toBe('2026-01-01T00:00:00.000Z');
    expect(rental.endTime).toBe(rental.startTime);

    vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'));
    rental.end();
    expect(rental.endTime).toBe('2026-01-01T00:01:00.000Z');
  });

  it('tracks lock and unlock without adding Bike attributes', () => {
    const bike = new Bike('b1', 80);

    bike.lock();
    expect(isBikeLocked(bike)).toBe(true);
    bike.unlock();
    expect(isBikeLocked(bike)).toBe(false);
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
