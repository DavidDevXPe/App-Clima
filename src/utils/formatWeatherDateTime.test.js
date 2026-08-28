import { describe, expect, it } from 'vitest';
import {
  formatWeatherDate,
  formatWeatherTime,
  isTimezoneOffsetSeconds,
} from './formatWeatherDateTime';

describe('formato de fecha y hora meteorológica', () => {
  it('aplica un offset negativo que cruza al día anterior', () => {
    const observedAt = '2026-08-23T02:30:00.000Z';

    expect(formatWeatherTime(observedAt, -18_000)).toBe('9:30 p. m.');
    expect(formatWeatherDate(observedAt, -18_000)).toBe('Sábado, 22 de agosto');
  });

  it.each([-43_200, 0, 20_700, 50_400])('acepta el offset válido %i', (offset) => {
    expect(isTimezoneOffsetSeconds(offset)).toBe(true);
  });

  it.each([-43_201, 50_401, 3_600.5, Number.NaN])(
    'rechaza el offset inválido %s',
    (offset) => {
      expect(isTimezoneOffsetSeconds(offset)).toBe(false);
    },
  );

  it('devuelve null si el desplazamiento excede el rango de Date', () => {
    const maximumDate = '+275760-09-13T00:00:00.000Z';

    expect(formatWeatherTime(maximumDate, 1)).toBeNull();
    expect(formatWeatherDate(maximumDate, 1)).toBeNull();
  });
});
