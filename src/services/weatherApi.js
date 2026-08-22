const WEATHER_ENDPOINT = '/api/weather';
const COORDINATE_DECIMALS = 8;

export class WeatherApiError extends Error {
  constructor(message, code = 'WEATHER_REQUEST_FAILED') {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

const isFiniteNumber = (value) => Number.isFinite(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isString = (value) => typeof value === 'string';

function serializeCoordinate(value, minimum, maximum) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new WeatherApiError(
      'Las coordenadas de ubicación recibidas no son válidas.',
      'INVALID_COORDINATES',
    );
  }

  return value.toFixed(COORDINATE_DECIMALS);
}

export function isWeatherData(value) {
  return Boolean(
    value &&
      isNonEmptyString(value.location?.city) &&
      isString(value.location?.country) &&
      isNonEmptyString(value.condition?.description) &&
      /^[0-9]{2}[dn]$/.test(value.condition?.icon) &&
      isFiniteNumber(value.metrics?.temperatureC) &&
      isFiniteNumber(value.metrics?.feelsLikeC) &&
      isFiniteNumber(value.metrics?.humidity) &&
      isFiniteNumber(value.metrics?.pressureHpa) &&
      isFiniteNumber(value.metrics?.windSpeedMs) &&
      isFiniteNumber(value.metrics?.cloudiness) &&
      isNonEmptyString(value.observedAt),
  );
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    throw new WeatherApiError('El servicio meteorológico devolvió una respuesta inválida.');
  }
}

export async function fetchWeather(query, { signal } = {}) {
  const searchParams = new URLSearchParams();

  if (query.city) {
    searchParams.set('city', query.city);
  } else {
    searchParams.set('lat', serializeCoordinate(query.lat, -90, 90));
    searchParams.set('lon', serializeCoordinate(query.lon, -180, 180));
  }

  const response = await fetch(`${WEATHER_ENDPOINT}?${searchParams}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new WeatherApiError(
      payload?.error?.message || 'No se pudo consultar el clima en este momento.',
      payload?.error?.code,
    );
  }

  if (!isWeatherData(payload?.data)) {
    throw new WeatherApiError('Los datos meteorológicos recibidos están incompletos.');
  }

  return payload.data;
}
