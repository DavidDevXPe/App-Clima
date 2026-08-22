import { AppError } from "./errors.js";

export const OPENWEATHER_CURRENT_URL =
  "https://api.openweathermap.org/data/2.5/weather";
export const DEFAULT_UPSTREAM_TIMEOUT_MS = 8_000;
export const DEFAULT_CACHE_TTL_MS = 5 * 60_000;
export const DEFAULT_CACHE_MAX_ENTRIES = 250;

const ICON_PATTERN = /^\d{2}[dn]$/;

function invalidUpstreamResponse() {
  throw new AppError(
    502,
    "INVALID_WEATHER_RESPONSE",
    "El servicio del clima devolvió una respuesta no válida.",
  );
}

function requireString(value, { allowEmpty = false, pattern } = {}) {
  if (
    typeof value !== "string" ||
    (!allowEmpty && value.trim().length === 0) ||
    (pattern && !pattern.test(value))
  ) {
    invalidUpstreamResponse();
  }

  return value.trim();
}

function requireNumber(value, { minimum = -Infinity, maximum = Infinity } = {}) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    invalidUpstreamResponse();
  }

  return value;
}

export function mapOpenWeatherResponse(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    invalidUpstreamResponse();
  }

  const condition = Array.isArray(payload.weather) ? payload.weather[0] : null;
  const observedTimestamp = requireNumber(payload.dt, { minimum: 1 });
  const observedDate = new Date(observedTimestamp * 1_000);

  if (Number.isNaN(observedDate.getTime())) {
    invalidUpstreamResponse();
  }

  return {
    location: {
      city: requireString(payload.name, { allowEmpty: true }) || "Ubicación actual",
      country: requireString(payload.sys?.country, {
        allowEmpty: true,
        pattern: /^(?:[A-Z]{2})?$/,
      }),
    },
    condition: {
      description: requireString(condition?.description),
      icon: requireString(condition?.icon, { pattern: ICON_PATTERN }),
    },
    metrics: {
      temperatureC: requireNumber(payload.main?.temp),
      feelsLikeC: requireNumber(payload.main?.feels_like),
      humidity: requireNumber(payload.main?.humidity, {
        minimum: 0,
        maximum: 100,
      }),
      pressureHpa: requireNumber(payload.main?.pressure, { minimum: 1 }),
      windSpeedMs: requireNumber(payload.wind?.speed, { minimum: 0 }),
      cloudiness: requireNumber(payload.clouds?.all, {
        minimum: 0,
        maximum: 100,
      }),
    },
    observedAt: observedDate.toISOString(),
  };
}

function cacheKeyFor(query) {
  if (query.type === "city") {
    return `city:${query.city.toLocaleLowerCase("es")}`;
  }

  return `coordinates:${query.lat},${query.lon}`;
}

function addQueryParameters(url, query) {
  if (query.type === "city") {
    url.searchParams.set("q", query.city);
    return;
  }

  url.searchParams.set("lat", String(query.lat));
  url.searchParams.set("lon", String(query.lon));
}

function upstreamStatusError(status) {
  if (status === 404) {
    return new AppError(
      404,
      "WEATHER_NOT_FOUND",
      "No se encontró información del clima para esa ubicación.",
    );
  }

  if (status === 429) {
    return new AppError(
      503,
      "WEATHER_SERVICE_BUSY",
      "El servicio del clima está temporalmente ocupado.",
    );
  }

  return new AppError(
    502,
    "WEATHER_SERVICE_UNAVAILABLE",
    "No se pudo obtener la información del clima.",
  );
}

export function createWeatherService({
  apiKey = process.env.OPENWEATHER_API_KEY,
  fetchImpl = globalThis.fetch,
  upstreamUrl = OPENWEATHER_CURRENT_URL,
  timeoutMs = DEFAULT_UPSTREAM_TIMEOUT_MS,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  cacheMaxEntries = DEFAULT_CACHE_MAX_ENTRIES,
  now = Date.now,
} = {}) {
  const cache = new Map();
  const inFlightRequests = new Map();

  async function requestWeather(query) {
    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new AppError(
        503,
        "WEATHER_SERVICE_NOT_CONFIGURED",
        "El servicio del clima no está configurado.",
      );
    }

    if (typeof fetchImpl !== "function") {
      throw new AppError(
        503,
        "WEATHER_SERVICE_NOT_CONFIGURED",
        "El servicio del clima no está configurado.",
      );
    }

    const url = new URL(upstreamUrl);
    addQueryParameters(url, query);
    url.searchParams.set("appid", apiKey.trim());
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "es");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "error",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw upstreamStatusError(response.status);
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        invalidUpstreamResponse();
      }

      return mapOpenWeatherResponse(payload);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (controller.signal.aborted || error?.name === "AbortError") {
        throw new AppError(
          504,
          "WEATHER_SERVICE_TIMEOUT",
          "El servicio del clima tardó demasiado en responder.",
        );
      }

      throw new AppError(
        502,
        "WEATHER_SERVICE_UNAVAILABLE",
        "No se pudo conectar con el servicio del clima.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return async function getWeather(query) {
    const key = cacheKeyFor(query);
    const currentTime = now();
    const cached = cache.get(key);

    if (cached && cached.expiresAt > currentTime) {
      cache.delete(key);
      cache.set(key, cached);
      return cached.value;
    }

    if (cached) {
      cache.delete(key);
    }

    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key);
    }

    const pendingRequest = requestWeather(query)
      .then((value) => {
        if (cacheTtlMs > 0 && cacheMaxEntries > 0) {
          for (const [cachedKey, cachedValue] of cache) {
            if (cachedValue.expiresAt <= now()) {
              cache.delete(cachedKey);
            }
          }

          while (cache.size >= cacheMaxEntries) {
            cache.delete(cache.keys().next().value);
          }

          cache.set(key, {
            value,
            expiresAt: now() + cacheTtlMs,
          });
        }

        return value;
      })
      .finally(() => {
        inFlightRequests.delete(key);
      });

    inFlightRequests.set(key, pendingRequest);
    return pendingRequest;
  };
}
