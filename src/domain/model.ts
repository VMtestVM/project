import { applyBikeTrigger } from './stateMachine';
import { dockBikeAtStation, releaseBikeFromStation } from './stationInventory';
import { lockBike, unlockBike } from './bikeLock';

/** ISO 8601 UTC timestamp string used by the UML `DateTime` type. */
export type DateTime = string;

/** Opaque payment-method value; accepted values are not defined by the model. */
export type PaymentMethod = string;

/** Bike states declared by the state diagram. */
export type BikeState = 'Available' | 'Reserved' | 'InUse' | 'Maintenance';

/** Customer identity and payment-method data. Source: class.drawio#User. */
export class User {
  /** Source: class.drawio#User_f0. */
  public userId: string;

  /** Source: class.drawio#User_f1. */
  public name: string;

  /** Source: class.drawio#User_f2. */
  public paymentMethod: PaymentMethod;

  /** Initializes the three public attributes declared for User. */
  public constructor(userId: string, name: string, paymentMethod: PaymentMethod) {
    this.userId = userId;
    this.name = name;
    this.paymentMethod = paymentMethod;
  }
}

/** Rental identity, times, and cost. Source: class.drawio#Rental. */
export class Rental {
  /** Source: class.drawio#Rental_f0. */
  public rentalId: string;

  /** Source: class.drawio#Rental_f1. */
  public startTime: DateTime;

  /** Source: class.drawio#Rental_f2. */
  public endTime: DateTime;

  /** Source: class.drawio#Rental_f3. */
  public cost: number;

  /** Initializes the four public attributes declared for Rental. */
  public constructor(
    rentalId: string,
    startTime: DateTime,
    endTime: DateTime,
    cost: number,
  ) {
    this.rentalId = rentalId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.cost = cost;
  }

  /** Starts this rental. Source: class.drawio#Rental_m0. */
  public start(): void {
    const startedAt = new Date().toISOString();
    this.startTime = startedAt;
    this.endTime = startedAt;
  }

  /** Ends this rental. Source: class.drawio#Rental_m1. */
  public end(): void {
    this.endTime = new Date().toISOString();
  }
}

/** Docking station attributes and operations. Source: class.drawio#Station. */
export class Station {
  /** Source: class.drawio#Station_f0. */
  public stationId: string;

  /** Source: class.drawio#Station_f1. */
  public capacity: number;

  /** Initializes the two public attributes declared for Station. */
  public constructor(stationId: string, capacity: number) {
    this.stationId = stationId;
    this.capacity = capacity;
  }

  /** Docks a bike. Source: class.drawio#Station_m0. */
  public dockBike(bike: Bike): void {
    dockBikeAtStation(this, bike);
  }

  /** Releases a bike. Source: class.drawio#Station_m1. */
  public releaseBike(): Bike {
    return releaseBikeFromStation(this);
  }
}

/** Bike identity, battery level, and state. Source: class.drawio#Bike. */
export class Bike {
  /** Source: class.drawio#Bike_f0. */
  public bikeId: string;

  /** Source: class.drawio#Bike_f1. */
  public batteryLevel: number;

  /** Source: class.drawio#Bike_f2. */
  public state: BikeState;

  /** Initializes the three public attributes declared for Bike. */
  public constructor(bikeId: string, batteryLevel: number) {
    if (!Number.isInteger(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      throw new RangeError('Bike battery level must be an integer from 0 to 100.');
    }

    this.bikeId = bikeId;
    this.batteryLevel = batteryLevel;
    this.state = 'Available';
  }

  /** Locks this bike. Source: class.drawio#Bike_m0. */
  public lock(): void {
    lockBike(this);
  }

  /** Unlocks this bike. Source: class.drawio#Bike_m1. */
  public unlock(): void {
    applyBikeTrigger(this, 'unlock()');
    unlockBike(this);
  }
}

/** Diagram relationship metadata retained for conformance tests and traceability. */
export const domainRelationships = [
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
] as const;
