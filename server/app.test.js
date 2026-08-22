// @vitest-environment node

import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { openWeatherFixture } from '../src/test/fixtures.js';
import { createApp } from './app.js';

function upstreamResponse(payload = openWeatherFixture, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

function createTestApp(options = {}) {
  return createApp({
    apiKey: 'test-server-key',
    logger: { error: vi.fn() },
    ...options,
  });
}

describe('API meteorológica', () => {
  it('expone un endpoint de salud sin caché', async () => {
    const response = await request(createTestApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('valida, consulta y normaliza una búsqueda por ciudad', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse());
    const response = await request(createTestApp({ fetchImpl })).get('/api/weather').query({ city: 'Lima' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      location: { city: 'Lima', country: 'PE' },
      metrics: { temperatureC: 22.5, windSpeedMs: 3.2 },
    });

    const upstreamUrl = new URL(fetchImpl.mock.calls[0][0]);
    expect(upstreamUrl.searchParams.get('q')).toBe('Lima');
    expect(upstreamUrl.searchParams.get('units')).toBe('metric');
    expect(upstreamUrl.searchParams.get('lang')).toBe('es');
    expect(upstreamUrl.searchParams.get('appid')).toBe('test-server-key');
    expect(JSON.stringify(response.body)).not.toContain('test-server-key');
  });

  it('rechaza parámetros ambiguos antes de consumir la API externa', async () => {
    const fetchImpl = vi.fn();
    const response = await request(createTestApp({ fetchImpl }))
      .get('/api/weather')
      .query({ city: 'Lima', lat: '-12', lon: '-77' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_QUERY');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('cachea consultas iguales para reducir el uso de cuota', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse());
    const app = createTestApp({ fetchImpl });

    await request(app).get('/api/weather').query({ city: 'Lima' }).expect(200);
    await request(app).get('/api/weather').query({ city: 'Lima' }).expect(200);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('aplica el límite de solicitudes por cliente', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse());
    const app = createTestApp({ fetchImpl, rateLimitMaxRequests: 1 });

    await request(app).get('/api/weather').query({ city: 'Lima' }).expect(200);
    const response = await request(app).get('/api/weather').query({ city: 'Cusco' });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(response.headers['retry-after']).toBeDefined();
  });

  it('no inicia una consulta si falta la clave del servidor', async () => {
    const fetchImpl = vi.fn();
    const response = await request(createTestApp({ apiKey: '', fetchImpl }))
      .get('/api/weather')
      .query({ city: 'Lima' });

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('WEATHER_SERVICE_NOT_CONFIGURED');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('cancela y traduce un timeout del proveedor sin filtrar secretos', async () => {
    const fetchImpl = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const response = await request(createTestApp({ fetchImpl, timeoutMs: 5 }))
      .get('/api/weather')
      .query({ city: 'Lima' });

    expect(response.status).toBe(504);
    expect(response.body.error.code).toBe('WEATHER_SERVICE_TIMEOUT');
    expect(JSON.stringify(response.body)).not.toContain('test-server-key');
  });
});
