import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('rent and return interface', () => {
  it('shows the demo bike and starts the rent sequence with a keyboard-operable button', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /your next ride/i, level: 1 }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'City e-bike' })).toBeTruthy();
    expect(screen.getByText('Bike bike-001')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'Choose the demo bike to begin a rental.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Rent this bike' }));

    expect(screen.getByText('On your ride')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Return this bike' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Ride started.');
  });

  it('completes the return sequence and displays the minimal successful receipt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Rent this bike' }));
    vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'));
    fireEvent.click(screen.getByRole('button', { name: 'Return this bike' }));

    expect(screen.getByRole('heading', { name: 'Your receipt' })).toBeTruthy();
    expect(screen.getByText('rental-001')).toBeTruthy();
    expect(screen.getByText('€1.15')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'Bike returned and payment completed.',
    );
    expect(screen.getByRole('button', { name: 'Rent this bike' })).toBeTruthy();
  });

  it('restores the seeded bike when the application is reloaded', () => {
    const view = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Rent this bike' }));
    expect(screen.getByText('On your ride')).toBeTruthy();

    view.unmount();
    render(<App />);

    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Rent this bike' })).toBeTruthy();
  });
});
