import { describe, expect, it } from 'vitest';
import { weatherFixture } from '../test/fixtures';
import { isWeatherData } from './weatherApi';

describe('contrato meteorológico del cliente', () => {
  it('acepta un modelo completo con zona horaria válida', () => {
    expect(isWeatherData(weatherFixture)).toBe(true);
  });

  it.each([
    ['ausente', undefined],
    ['fraccionaria', -18_000.5],
    ['fuera del rango UTC', 54_000],
  ])('rechaza una zona horaria %s', (_description, timezoneOffsetSeconds) => {
    expect(isWeatherData({ ...weatherFixture, timezoneOffsetSeconds })).toBe(false);
  });

  it('rechaza una fecha de observación inválida', () => {
    expect(isWeatherData({ ...weatherFixture, observedAt: 'fecha-inválida' })).toBe(false);
  });
});
