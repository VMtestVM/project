import { useState } from 'react';
import { rentBike } from './application/rentBike';
import { returnBike } from './application/returnBike';
import type { RentalReceipt } from './application/returnBike';
import type { Bike } from './domain/model';
import { createSeededMockState } from './infrastructure/mock/seedData';

const euroFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
});

/** Presents the diagrammed rent and return flows using fresh in-memory seed data. */
export function App() {
  const [mockState] = useState(createSeededMockState);
  const [bike, setBike] = useState<Bike>(() => {
    const seededBike = mockState.bikes[0];
    if (!seededBike) {
      throw new Error('The mock seed must include a demo bike.');
    }
    return seededBike;
  });
  const [status, setStatus] = useState('Choose the demo bike to begin a rental.');
  const [receipt, setReceipt] = useState<RentalReceipt | null>(null);

  function handleRent(): void {
    const result = rentBike(mockState, bike.bikeId);
    setBike(result.bike);
    setReceipt(null);
    setStatus('Ride started. Return the bike to complete your rental.');
  }

  function handleReturn(): void {
    const result = returnBike(mockState);
    setBike(result.bike);
    setReceipt(result.receipt);
    setStatus('Bike returned and payment completed.');
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="E-bike rental home">
          <span className="brand-mark" aria-hidden="true">
            E
          </span>
          <span>Pedal</span>
        </a>
        <span className="header-note">City bike share</span>
      </header>

      <section className="rental-panel" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">Simple rides, greener days</p>
          <h1 id="page-title">
            Your next ride
            <br />
            starts here.
          </h1>
          <p className="intro-copy">
            Choose the demo e-bike to start, then return it to finish your ride.
          </p>
        </div>

        <article className="bike-card" aria-labelledby="bike-title">
          <div className="bike-card-top">
            <div>
              <p className="card-kicker">Ready when you are</p>
              <h2 id="bike-title">City e-bike</h2>
              <p className="bike-id">Bike {bike.bikeId}</p>
            </div>
            <span className={`state-pill state-${bike.state.toLowerCase()}`}>
              <span className="state-dot" aria-hidden="true" />
              {bike.state === 'InUse' ? 'On your ride' : bike.state}
            </span>
          </div>

          <div className="bike-illustration" aria-hidden="true">
            <svg viewBox="0 0 420 180" role="presentation">
              <circle cx="102" cy="126" r="42" />
              <circle cx="326" cy="126" r="42" />
              <path d="M102 126 160 66l49 60h-107l55-60h76l38 60 33-60" />
              <path d="M151 66h-22m119 0h24m-57 0 13-17h28" />
              <rect x="186" y="90" width="26" height="18" rx="6" />
              <path d="M102 126h-18m242 0h18" />
            </svg>
          </div>

          <div className="bike-details">
            <div className="battery-copy">
              <span className="battery-icon" aria-hidden="true">
                ▰
              </span>
              <span>Battery</span>
            </div>
            <strong>{bike.batteryLevel}%</strong>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={bike.state === 'InUse' ? handleReturn : handleRent}
          >
            {bike.state === 'InUse' ? 'Return this bike' : 'Rent this bike'}
            <span aria-hidden="true">{bike.state === 'InUse' ? '↩' : '→'}</span>
          </button>
        </article>

        <div className="action-result" role="status" aria-live="polite">
          <span className="result-icon" aria-hidden="true">
            ✓
          </span>
          <p>{status}</p>
        </div>

        {receipt && (
          <section className="receipt" aria-labelledby="receipt-title">
            <div>
              <p className="card-kicker">Ride complete</p>
              <h2 id="receipt-title">Your receipt</h2>
            </div>
            <dl>
              <div>
                <dt>Rental</dt>
                <dd>{receipt.rentalId}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{euroFormatter.format(receipt.cost)}</dd>
              </div>
            </dl>
          </section>
        )}
      </section>

      <footer className="site-footer">
        <span>Good rides, lighter footprints.</span>
        <span>Demo experience</span>
      </footer>
    </main>
  );
}
