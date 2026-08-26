function createRegionDisplayNames() {
  try {
    return typeof Intl.DisplayNames === 'function'
      ? new Intl.DisplayNames(['es-PE'], { type: 'region' })
      : null;
  } catch {
    return null;
  }
}

const regionDisplayNames = createRegionDisplayNames();

export function formatCountryName(countryCode) {
  if (typeof countryCode !== 'string' || countryCode.trim().length === 0) return countryCode;

  const normalizedCode = countryCode.trim().toUpperCase();

  try {
    return regionDisplayNames?.of(normalizedCode) || countryCode;
  } catch {
    return countryCode;
  }
}
