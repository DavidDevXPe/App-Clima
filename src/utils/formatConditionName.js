const conditionPatterns = [
  { label: 'Tormenta', pattern: /thunder|storm|torment/ },
  { label: 'Llovizna', pattern: /drizzle|lloviz/ },
  { label: 'Lluvia', pattern: /rain|lluv/ },
  { label: 'Nieve', pattern: /snow|nieve/ },
  { label: 'Niebla', pattern: /mist|fog|haze|niebl|bruma|calima/ },
  { label: 'Nublado', pattern: /cloud|nube|nublad/ },
  { label: 'Despejado', pattern: /clear|claro|despejad/ },
];

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

export function formatConditionName(description, icon) {
  if (typeof description !== 'string' || description.trim().length === 0) return description;

  const normalizedDescription = normalizeCondition(description);
  const matchedCondition = conditionPatterns.find(({ pattern }) => pattern.test(normalizedDescription));

  return matchedCondition?.label || conditionLabelsByIcon[icon?.slice(0, 2)] || description;
}
