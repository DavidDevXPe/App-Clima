const conditionPatterns = [
  { label: 'Tormenta', pattern: /thunder|storm|torment/ },
  { label: 'Llovizna', pattern: /drizzle|lloviz/ },
  { label: 'Lluvia', pattern: /rain|lluv/ },
  { label: 'Nieve', pattern: /snow|nieve/ },
  { label: 'Niebla', pattern: /mist|fog|haze|niebl|bruma|calima/ },
  { label: 'Nublado', pattern: /cloud|nube|nublad|nubos/ },
  { label: 'Despejado', pattern: /clear|claro|despejad/ },
];

const genericConditionDescriptions = new Set([
  'clear',
  'clear sky',
  'cielo claro',
  'despejado',
  'clouds',
  'cloudy',
  'nubes',
  'nublado',
  'nuboso',
  'rain',
  'lluvia',
  'drizzle',
  'llovizna',
  'thunderstorm',
  'storm',
  'tormenta',
  'snow',
  'nieve',
  'mist',
  'fog',
  'haze',
  'niebla',
  'neblina',
  'bruma',
  'calima',
]);

const englishConditionPattern = /thunder|storm|drizzle|rain|snow|mist|fog|haze|cloud|clear/;

const conditionLabelsByIcon = {
  '01': 'Despejado',
  '02': 'Nublado',
  '03': 'Nublado',
  '04': 'Nublado',
  '09': 'Lluvia',
  '10': 'Lluvia',
  '11': 'Tormenta',
  '13': 'Nieve',
  '50': 'Niebla',
};

function normalizeCondition(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function capitalizeFirst(value) {
  return value.charAt(0).toLocaleUpperCase('es-PE') + value.slice(1);
}

export function formatConditionName(description, icon) {
  const iconFallback = conditionLabelsByIcon[icon?.slice(0, 2)];

  if (typeof description !== 'string' || description.trim().length === 0) {
    return iconFallback || description;
  }

  const trimmedDescription = description.trim();
  const normalizedDescription = normalizeCondition(trimmedDescription);
  const matchedCondition = conditionPatterns.find(({ pattern }) => pattern.test(normalizedDescription));

  if (
    matchedCondition
    && (genericConditionDescriptions.has(normalizedDescription)
      || englishConditionPattern.test(normalizedDescription))
  ) {
    return matchedCondition.label;
  }

  return capitalizeFirst(trimmedDescription);
}
