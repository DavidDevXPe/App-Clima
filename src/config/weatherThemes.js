import clearDayBackground from '../assets/weather/backgrounds/clear-day.webp';
import clearNightBackground from '../assets/weather/backgrounds/clear-night.webp';
import cloudyBackground from '../assets/weather/backgrounds/cloudy.webp';
import mistBackground from '../assets/weather/backgrounds/mist.webp';
import rainBackground from '../assets/weather/backgrounds/rain.webp';
import snowBackground from '../assets/weather/backgrounds/snow.webp';
import stormBackground from '../assets/weather/backgrounds/storm.webp';
import cloudOverlay from '../assets/weather/overlays/cloud-overlay.png';
import mistOverlay from '../assets/weather/overlays/mist-overlay.png';
import rainOverlay from '../assets/weather/overlays/rain-overlay.png';
import starsOverlay from '../assets/weather/overlays/stars-overlay.png';
import sunGlow from '../assets/weather/overlays/sun-glow.png';

const clearDay = {
  accent: '#38c7ff',
  background: clearDayBackground,
  id: 'clear-day',
  overlay: sunGlow,
  overlayOpacity: 0.18,
};

const clearNight = {
  accent: '#829fff',
  background: clearNightBackground,
  id: 'clear-night',
  overlay: starsOverlay,
  overlayOpacity: 0.25,
};

const cloudy = {
  accent: '#9dd7e8',
  background: cloudyBackground,
  id: 'cloudy',
  overlay: cloudOverlay,
  overlayOpacity: 0.18,
};

const rain = {
  accent: '#67d5ff',
  background: rainBackground,
  id: 'rain',
  overlay: rainOverlay,
  overlayOpacity: 0.29,
};

const storm = {
  accent: '#b79cff',
  background: stormBackground,
  id: 'storm',
  overlay: rainOverlay,
  overlayOpacity: 0.32,
};

const snow = {
  accent: '#d7f2ff',
  background: snowBackground,
  id: 'snow',
  overlay: null,
  overlayOpacity: 0,
};

const mist = {
  accent: '#b7d2da',
  background: mistBackground,
  id: 'mist',
  overlay: mistOverlay,
  overlayOpacity: 0.21,
};

export const DEFAULT_WEATHER_THEME = clearNight;

export const WEATHER_THEMES = {
  '01d': clearDay,
  '01n': clearNight,
  '02d': cloudy,
  '02n': cloudy,
  '03d': cloudy,
  '03n': cloudy,
  '04d': cloudy,
  '04n': cloudy,
  '09d': rain,
  '09n': rain,
  '10d': rain,
  '10n': rain,
  '11d': storm,
  '11n': storm,
  '13d': snow,
  '13n': snow,
  '50d': mist,
  '50n': mist,
};

export function getWeatherTheme(icon) {
  return WEATHER_THEMES[icon] ?? cloudy;
}
