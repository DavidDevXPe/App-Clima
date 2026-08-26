import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { weatherFixture } from '../test/fixtures';
import { formatConditionName } from '../utils/formatConditionName';
import { formatCountryName } from '../utils/formatCountryName';
import WeatherCard from './WeatherCard';

describe('WeatherCard', () => {
  it('muestra un modelo meteorológico normalizado sin valores indefinidos', () => {
    const { container } = render(<WeatherCard weather={weatherFixture} />);
    const heroTemperature = container.querySelector('.weather-card__temperature');

    expect(screen.getByRole('heading', { name: /Lima, Perú/i })).toBeInTheDocument();
    expect(heroTemperature).toHaveTextContent(/^22.5°$/);
    expect(heroTemperature).not.toHaveTextContent(/[CF]/);
    expect(screen.getByText('Sensación térmica 23.1°C')).toBeInTheDocument();
    expect(screen.getByText('Despejado')).toBeInTheDocument();
    expect(screen.getByText('Sábado, 22 de agosto')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('undefined');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('cambia de forma coherente la temperatura y el viento al sistema imperial', async () => {
    const user = userEvent.setup();
    const { container } = render(<WeatherCard weather={weatherFixture} />);
    const unitButton = screen.getByRole('button', { name: /cambiar al sistema imperial/i });

    await user.click(unitButton);

    expect(container.querySelector('.weather-card__temperature')).toHaveTextContent(/^72.5°$/);
    expect(screen.getByText('Sensación térmica 73.6°F')).toBeInTheDocument();
    expect(screen.getByText('7.2', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar al sistema métrico/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it.each([
    ['PE', 'Perú'],
    ['ES', 'España'],
    ['US', 'Estados Unidos'],
    ['JP', 'Japón'],
    ['GB', 'Reino Unido'],
    ['DO', 'República Dominicana'],
  ])('presenta el código %s como %s', (countryCode, expectedName) => {
    render(
      <WeatherCard
        weather={{
          ...weatherFixture,
          location: { ...weatherFixture.location, country: countryCode },
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: new RegExp(`Lima, ${expectedName}`, 'i') }))
      .toBeInTheDocument();
  });

  it('conserva el código original cuando Intl no puede resolverlo', () => {
    expect(formatCountryName('invalid')).toBe('invalid');
  });

  it.each([
    ['nubes dispersas', '03d', 'Nublado'],
    ['clear sky', '01d', 'Despejado'],
    ['lluvia ligera', '10d', 'Lluvia'],
    ['llovizna ligera', '09d', 'Llovizna'],
    ['tormenta eléctrica', '11d', 'Tormenta'],
    ['nieve', '13d', 'Nieve'],
    ['niebla', '50d', 'Niebla'],
  ])('presenta %s (%s) como %s', (description, icon, expectedName) => {
    expect(formatConditionName(description, icon)).toBe(expectedName);
  });
});
