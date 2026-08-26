// @vitest-environment node

import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openWeatherFixture } from '../src/test/fixtures.js';

function upstreamResponse(payload = openWeatherFixture, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

async function loadWeatherAdapter({ apiKey = 'test-vercel-key', response } = {}) {
  vi.resetModules();
  vi.stubEnv('OPENWEATHER_API_KEY', apiKey);

  const fetchImpl = vi.fn().mockResolvedValue(response ?? upstreamResponse());
  vi.stubGlobal('fetch', fetchImpl);

  const { default: handler } = await import('../api/weather.js');

  return { fetchImpl, handler };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('adaptadores para Vercel Functions', () => {
  it('expone el health check como JSON sin secretos', async () => {
    vi.resetModules();
    const { default: handler } = await import('../api/health.js');
    const response = await request(handler).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.status).toBe('ok');
    expect(JSON.stringify(response.body)).not.toContain('OPENWEATHER_API_KEY');
  });

  it('atiende una ciudad válida mediante la aplicación Express existente', async () => {
    const upstreamPayload = { ...openWeatherFixture, name: 'Paita' };
    const { fetchImpl, handler } = await loadWeatherAdapter({
      response: upstreamResponse(upstreamPayload),
    });
    const response = await request(handler).get('/api/weather').query({ city: 'Paita' });

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.data).toMatchObject({
      location: { city: 'Paita', country: 'PE' },
      metrics: { temperatureC: 22.5, windSpeedMs: 3.2 },
    });
    expect(response.headers['ratelimit-limit']).toBe('60');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(response.body)).not.toContain('test-vercel-key');
  });

  it('rechaza una query inválida antes de llamar a OpenWeather', async () => {
    const { fetchImpl, handler } = await loadWeatherAdapter();
    const response = await request(handler).get('/api/weather?city=');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: expect.objectContaining({ code: 'INVALID_QUERY' }),
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('conserva los errores controlados del proveedor', async () => {
    const { handler } = await loadWeatherAdapter({
      response: upstreamResponse({ message: 'city not found' }, 404),
    });
    const response = await request(handler).get('/api/weather').query({ city: 'Atlantis' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'WEATHER_NOT_FOUND',
        message: 'No se encontró información del clima para esa ubicación.',
      },
    });
  });

  it('devuelve un error controlado cuando falta OPENWEATHER_API_KEY', async () => {
    const { fetchImpl, handler } = await loadWeatherAdapter({ apiKey: '' });
    const response = await request(handler).get('/api/weather').query({ city: 'Paita' });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: 'WEATHER_SERVICE_NOT_CONFIGURED',
        message: 'El servicio del clima no está configurado.',
      },
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
