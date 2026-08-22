import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { weatherFixture } from '../test/fixtures';
import WeatherCard from './WeatherCard';

describe('WeatherCard', () => {
  it('muestra un modelo meteorológico normalizado sin valores indefinidos', () => {
    const { container } = render(<WeatherCard weather={weatherFixture} />);

    expect(screen.getByRole('heading', { name: /Lima, PE/i })).toBeInTheDocument();
    expect(screen.getByText('22.5')).toBeInTheDocument();
    expect(screen.getByText('cielo claro')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('undefined');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('cambia de forma coherente la temperatura y el viento al sistema imperial', async () => {
    const user = userEvent.setup();
    render(<WeatherCard weather={weatherFixture} />);
    const unitButton = screen.getByRole('button', { name: /cambiar al sistema imperial/i });

    await user.click(unitButton);

    expect(screen.getByText('72.5')).toBeInTheDocument();
    expect(screen.getByText('7.2', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar al sistema métrico/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
