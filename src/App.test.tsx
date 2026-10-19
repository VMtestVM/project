import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the minimal project shell without domain flows', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Welcome', level: 1 })).toBeTruthy();
    expect(
      screen.getByText(/features will be added in later implementation phases/i),
    ).toBeTruthy();
  });
});
