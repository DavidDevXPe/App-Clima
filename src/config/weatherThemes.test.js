import { describe, expect, it } from 'vitest';
import { getWeatherTheme } from './weatherThemes';

describe('weatherThemes', () => {
  it.each([
    ['01d', 'clear-day'],
    ['01n', 'clear-night'],
    ['02d', 'cloudy'],
    ['03n', 'cloudy'],
    ['04d', 'cloudy'],
    ['09n', 'rain'],
    ['10d', 'rain'],
    ['11n', 'storm'],
    ['13d', 'snow'],
    ['50n', 'mist'],
  ])('mapea %s al tema %s', (icon, expectedTheme) => {
    expect(getWeatherTheme(icon).id).toBe(expectedTheme);
  });

  it('utiliza cloudy como fallback seguro para iconos desconocidos', () => {
    expect(getWeatherTheme('unknown').id).toBe('cloudy');
  });
});
