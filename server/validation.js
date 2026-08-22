import { AppError } from "./errors.js";

export const MAX_CITY_LENGTH = 100;
export const MAX_COORDINATE_DECIMALS = 8;

const ALLOWED_QUERY_PARAMETERS = new Set(["city", "lat", "lon"]);
const COORDINATE_PATTERN = new RegExp(
  `^[+-]?(?:\\d{1,3}(?:\\.\\d{1,${MAX_COORDINATE_DECIMALS}})?|\\.\\d{1,${MAX_COORDINATE_DECIMALS}})$`,
);
const CITY_PATTERN = /^[\p{L}\p{M}\p{N} .,'’()-]+$/u;
const CITY_CONTENT_PATTERN = /[\p{L}\p{N}]/u;

function invalidQuery(message) {
  throw new AppError(400, "INVALID_QUERY", message);
}

function readSingleString(query, name) {
  const value = query[name];

  if (typeof value !== "string") {
    invalidQuery(`El parámetro '${name}' debe aparecer una sola vez.`);
  }

  return value;
}

function parseCoordinate(value, name, minimum, maximum) {
  if (!COORDINATE_PATTERN.test(value)) {
    invalidQuery(
      `El parámetro '${name}' debe ser un número decimal con hasta ${MAX_COORDINATE_DECIMALS} decimales.`,
    );
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    invalidQuery(
      `El parámetro '${name}' debe estar entre ${minimum} y ${maximum}.`,
    );
  }

  return number;
}

function parseCity(value) {
  if (
    value.length === 0 ||
    value.length > MAX_CITY_LENGTH ||
    value !== value.trim() ||
    !CITY_PATTERN.test(value) ||
    !CITY_CONTENT_PATTERN.test(value)
  ) {
    invalidQuery(
      `El parámetro 'city' debe ser un nombre válido de hasta ${MAX_CITY_LENGTH} caracteres, sin espacios al inicio o al final.`,
    );
  }

  return value;
}

export function parseWeatherQuery(query) {
  const keys = Object.keys(query);
  const unknownParameters = keys.filter(
    (key) => !ALLOWED_QUERY_PARAMETERS.has(key),
  );

  if (unknownParameters.length > 0) {
    invalidQuery(
      `Parámetro no admitido: '${unknownParameters.sort()[0]}'.`,
    );
  }

  const hasCity = Object.hasOwn(query, "city");
  const hasLatitude = Object.hasOwn(query, "lat");
  const hasLongitude = Object.hasOwn(query, "lon");

  if (hasCity && (hasLatitude || hasLongitude)) {
    invalidQuery("Usa 'city' o el par 'lat' y 'lon', pero no ambos.");
  }

  if (hasCity) {
    return {
      type: "city",
      city: parseCity(readSingleString(query, "city")),
    };
  }

  if (!hasLatitude && !hasLongitude) {
    invalidQuery("Debes indicar 'city' o el par 'lat' y 'lon'.");
  }

  if (!hasLatitude || !hasLongitude) {
    invalidQuery("Los parámetros 'lat' y 'lon' deben enviarse juntos.");
  }

  return {
    type: "coordinates",
    lat: parseCoordinate(readSingleString(query, "lat"), "lat", -90, 90),
    lon: parseCoordinate(
      readSingleString(query, "lon"),
      "lon",
      -180,
      180,
    ),
  };
}
