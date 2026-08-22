import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";

import { AppError, errorPayload } from "./errors.js";
import {
  createRateLimiter,
  DEFAULT_RATE_LIMIT_MAX_CLIENTS,
  DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
} from "./rate-limit.js";
import { parseWeatherQuery } from "./validation.js";
import {
  createWeatherService,
  DEFAULT_CACHE_MAX_ENTRIES,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_UPSTREAM_TIMEOUT_MS,
} from "./weather-service.js";

const SERVER_DIRECTORY = fileURLToPath(new URL(".", import.meta.url));
export const DEFAULT_DIST_DIRECTORY = resolve(SERVER_DIRECTORY, "..", "dist");

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function nonNegativeInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

export function createApp(options = {}) {
  const app = express();
  const nodeEnvironment = options.nodeEnv ?? process.env.NODE_ENV;
  const distDirectory = options.distDirectory ?? DEFAULT_DIST_DIRECTORY;
  const logger = options.logger ?? console;
  const apiKey = Object.hasOwn(options, "apiKey")
    ? options.apiKey
    : process.env.OPENWEATHER_API_KEY;
  const getWeather = createWeatherService({
    apiKey,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    upstreamUrl: options.upstreamUrl,
    timeoutMs: positiveInteger(
      options.timeoutMs ?? process.env.WEATHER_API_TIMEOUT_MS,
      DEFAULT_UPSTREAM_TIMEOUT_MS,
    ),
    cacheTtlMs: nonNegativeInteger(
      options.cacheTtlMs ?? process.env.WEATHER_CACHE_TTL_MS,
      DEFAULT_CACHE_TTL_MS,
    ),
    cacheMaxEntries: nonNegativeInteger(
      options.cacheMaxEntries ?? process.env.WEATHER_CACHE_MAX_ENTRIES,
      DEFAULT_CACHE_MAX_ENTRIES,
    ),
    now: options.now,
  });
  const weatherRateLimiter = createRateLimiter({
    windowMs: positiveInteger(
      options.rateLimitWindowMs ?? process.env.WEATHER_RATE_LIMIT_WINDOW_MS,
      DEFAULT_RATE_LIMIT_WINDOW_MS,
    ),
    maxRequests: positiveInteger(
      options.rateLimitMaxRequests ??
        process.env.WEATHER_RATE_LIMIT_MAX_REQUESTS,
      DEFAULT_RATE_LIMIT_MAX_REQUESTS,
    ),
    maxClients: positiveInteger(
      options.rateLimitMaxClients ??
        process.env.WEATHER_RATE_LIMIT_MAX_CLIENTS,
      DEFAULT_RATE_LIMIT_MAX_CLIENTS,
    ),
    now: options.now,
  });

  app.disable("x-powered-by");
  app.set("trust proxy", options.trustProxy ?? false);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );

  const healthHandler = (_request, response) => {
    response.set("Cache-Control", "no-store");
    response.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  };

  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  app.get(
    "/api/weather",
    weatherRateLimiter,
    async (request, response, next) => {
      try {
        const query = parseWeatherQuery(request.query);
        const data = await getWeather(query);

        response.set("Cache-Control", "private, max-age=60");
        response.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    },
  );

  app.use("/api", (_request, response) => {
    response
      .status(404)
      .json(errorPayload("API_ROUTE_NOT_FOUND", "Ruta de API no encontrada."));
  });

  if (nodeEnvironment === "production") {
    app.use(
      express.static(distDirectory, {
        dotfiles: "deny",
        fallthrough: true,
        index: false,
        maxAge: "1h",
      }),
    );

    const indexFile = resolve(distDirectory, "index.html");

    app.use((request, response, next) => {
      const hasHiddenPathSegment = request.path
        .split("/")
        .some((segment) => segment.startsWith("."));
      const canServeSpa =
        (request.method === "GET" || request.method === "HEAD") &&
        request.accepts("html") &&
        !hasHiddenPathSegment &&
        extname(request.path) === "";

      if (!canServeSpa) {
        next();
        return;
      }

      response.sendFile(indexFile, (error) => {
        if (error) {
          next(error);
        }
      });
    });
  }

  app.use((_request, response) => {
    response
      .status(404)
      .json(errorPayload("ROUTE_NOT_FOUND", "Ruta no encontrada."));
  });

  app.use((error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (error instanceof AppError) {
      response
        .status(error.status)
        .json(errorPayload(error.code, error.message));
      return;
    }

    logger.error?.("Error interno no controlado en el servidor.");
    response
      .status(500)
      .json(errorPayload("INTERNAL_ERROR", "Ocurrió un error interno."));
  });

  return app;
}

const app = createApp();

export default app;
