export const weatherFixture = {
  location: {
    city: 'Lima',
    country: 'PE',
  },
  condition: {
    description: 'cielo claro',
    icon: '01d',
  },
  metrics: {
    temperatureC: 22.5,
    feelsLikeC: 23.1,
    humidity: 71,
    pressureHpa: 1013,
    windSpeedMs: 3.2,
    cloudiness: 8,
  },
  observedAt: '2026-08-22T15:30:00.000Z',
};

export const openWeatherFixture = {
  name: 'Lima',
  sys: { country: 'PE' },
  weather: [{ description: 'cielo claro', icon: '01d' }],
  main: {
    temp: 22.5,
    feels_like: 23.1,
    humidity: 71,
    pressure: 1013,
  },
  wind: { speed: 3.2 },
  clouds: { all: 8 },
  dt: 1_777_047_000,
};
