const LOCALE = 'es-PE';
const MIN_TIMEZONE_OFFSET_SECONDS = -12 * 60 * 60;
const MAX_TIMEZONE_OFFSET_SECONDS = 14 * 60 * 60;

export function isTimezoneOffsetSeconds(value) {
  return (
    Number.isInteger(value) &&
    value >= MIN_TIMEZONE_OFFSET_SECONDS &&
    value <= MAX_TIMEZONE_OFFSET_SECONDS
  );
}

function getLocalDate(value, timezoneOffsetSeconds) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || !isTimezoneOffsetSeconds(timezoneOffsetSeconds)) {
    return null;
  }

  const localDate = new Date(date.getTime() + timezoneOffsetSeconds * 1_000);

  return Number.isNaN(localDate.getTime()) ? null : localDate;
}

export function formatWeatherTime(value, timezoneOffsetSeconds) {
  const localDate = getLocalDate(value, timezoneOffsetSeconds);

  if (!localDate) return null;

  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(localDate);
}

export function formatWeatherDate(value, timezoneOffsetSeconds) {
  const localDate = getLocalDate(value, timezoneOffsetSeconds);

  if (!localDate) return null;

  const formattedDate = new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
  }).format(localDate);

  return formattedDate.charAt(0).toLocaleUpperCase(LOCALE) + formattedDate.slice(1);
}
