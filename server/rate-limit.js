import { errorPayload } from "./errors.js";

export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 60;
export const DEFAULT_RATE_LIMIT_MAX_CLIENTS = 10_000;

function removeExpiredEntries(entries, currentTime) {
  for (const [key, value] of entries) {
    if (value.resetAt <= currentTime) {
      entries.delete(key);
    }
  }
}

export function createRateLimiter({
  windowMs = DEFAULT_RATE_LIMIT_WINDOW_MS,
  maxRequests = DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  maxClients = DEFAULT_RATE_LIMIT_MAX_CLIENTS,
  now = Date.now,
} = {}) {
  const entries = new Map();
  let requestCount = 0;

  return function rateLimiter(request, response, next) {
    const currentTime = now();
    const clientKey = request.ip || request.socket?.remoteAddress || "unknown";
    let entry = entries.get(clientKey);

    requestCount += 1;
    if (requestCount % 100 === 0 || entries.size >= maxClients) {
      removeExpiredEntries(entries, currentTime);
    }

    if (!entry || entry.resetAt <= currentTime) {
      if (!entry && entries.size >= maxClients) {
        entries.delete(entries.keys().next().value);
      }

      entry = {
        count: 0,
        resetAt: currentTime + windowMs,
      };
      entries.set(clientKey, entry);
    }

    const remaining = Math.max(0, maxRequests - entry.count - 1);
    const resetInSeconds = Math.max(
      1,
      Math.ceil((entry.resetAt - currentTime) / 1_000),
    );

    response.set("RateLimit-Limit", String(maxRequests));
    response.set("RateLimit-Remaining", String(remaining));
    response.set("RateLimit-Reset", String(resetInSeconds));

    if (entry.count >= maxRequests) {
      response.set("Retry-After", String(resetInSeconds));
      response.status(429).json(
        errorPayload(
          "RATE_LIMIT_EXCEEDED",
          "Demasiadas solicitudes. Inténtalo de nuevo más tarde.",
        ),
      );
      return;
    }

    entry.count += 1;
    next();
  };
}
