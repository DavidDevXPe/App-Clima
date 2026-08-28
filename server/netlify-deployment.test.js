// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openWeatherFixture } from '../src/test/fixtures.js';

const netlifyConfig = await readFile(
  new URL('../netlify.toml', import.meta.url),
  'utf8',
);
const SERVERLESS_TEST_TIMEOUT_MS = 15_000;

function upstreamResponse(payload = openWeatherFixture, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

function netlifyEvent(path, queryStringParameters = null) {
  return {
    body: '',
    headers: { accept: 'application/json' },
    httpMethod: 'GET',
    isBase64Encoded: false,
    path,
    queryStringParameters,
    requestContext: {
      identity: { sourceIp: '203.0.113.10' },
    },
  };
}

async function loadHandler({ apiKey = 'test-netlify-key', response } = {}) {
  vi.resetModules();
  vi.stubEnv('OPENWEATHER_API_KEY', apiKey);

  const fetchImpl = vi.fn().mockResolvedValue(response ?? upstreamResponse());
  vi.stubGlobal('fetch', fetchImpl);

  const { handler } = await import('../netlify/functions/api.mjs');

  return { fetchImpl, handler };
}

function jsonBody(response) {
  return JSON.parse(response.body);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('despliegue en Netlify', () => {
  it(
    'expone el health check mediante el handler serverless',
    async () => {
      const { handler } = await loadHandler();
      const response = await handler(netlifyEvent('/api/health'), {});

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(jsonBody(response).status).toBe('ok');
    },
    SERVERLESS_TEST_TIMEOUT_MS,
  );

  it('consulta el clima conservando la ruta y los parámetros originales', async () => {
    const upstreamPayload = { ...openWeatherFixture, name: 'Paita' };
    const { fetchImpl, handler } = await loadHandler({
      response: upstreamResponse(upstreamPayload),
    });
    const response = await handler(
      netlifyEvent('/api/weather', { city: 'Paita' }),
      {},
    );

    expect(response.statusCode).toBe(200);
    expect(jsonBody(response).data.location).toMatchObject({
      city: 'Paita',
      country: 'PE',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(response)).not.toContain('test-netlify-key');
  });

  it('rechaza consultas inválidas antes de contactar a OpenWeather', async () => {
    const { fetchImpl, handler } = await loadHandler();
    const response = await handler(
      netlifyEvent('/api/weather', { city: '' }),
      {},
    );

    expect(response.statusCode).toBe(400);
    expect(jsonBody(response).error.code).toBe('INVALID_QUERY');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('devuelve errores JSON para rutas API inexistentes', async () => {
    const { handler } = await loadHandler();
    const response = await handler(netlifyEvent('/api/no-existe'), {});

    expect(response.statusCode).toBe(404);
    expect(jsonBody(response).error.code).toBe('API_ROUTE_NOT_FOUND');
  });

  it('usa el patrón oficial de rewrite y protege el contenido estático', () => {
    expect(netlifyConfig).toMatch(
      /from = "\/api\/\*"\s+to = "\/\.netlify\/functions\/api\/:splat"\s+status = 200\s+force = true/,
    );
    expect(netlifyConfig).not.toContain('from = "/*"');
    expect(netlifyConfig).toContain('Content-Security-Policy');
    expect(netlifyConfig).toContain("style-src 'self' 'unsafe-inline'");
    expect(netlifyConfig).toContain('Permissions-Policy = "geolocation=(self)"');
    expect(netlifyConfig).toContain(
      'Cache-Control = "public, max-age=31536000, immutable"',
    );
  });
});
