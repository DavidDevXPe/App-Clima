import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  it('muestra la hora local de la ubicación aunque allí ya sea el día siguiente', () => {
    render(
      <AppHeader
        observedAt="2026-08-22T23:30:00.000Z"
        timezoneOffsetSeconds={7_200}
      />,
    );

    const timestamp = screen.getByText('1:30 a. m.');

    expect(timestamp).toHaveAttribute('dateTime', '2026-08-22T23:30:00.000Z');
    expect(screen.getByText(/actualizado:/i)).toHaveTextContent('Actualizado: 1:30 a. m.');
  });
});
