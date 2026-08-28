import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { formatConditionName } from '../utils/formatConditionName';
import { formatCountryName } from '../utils/formatCountryName';
import {
  formatWeatherDate,
  isTimezoneOffsetSeconds,
} from '../utils/formatWeatherDateTime';
import WeatherIcon from './WeatherIcon';
import WeatherMetric from './WeatherMetric';
import './styles/weatherCard.css';

const numberFormatter = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function formatNumber(value) {
  return numberFormatter.format(value);
}

function celsiusToFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

function metersPerSecondToMilesPerHour(value) {
  return value * 2.23694;
}

function WeatherCard({ weather }) {
  const [isMetric, setIsMetric] = useState(true);
  const titleId = useId();
  const { condition, location, metrics, observedAt, timezoneOffsetSeconds } = weather;
  const observationDate = formatWeatherDate(observedAt, timezoneOffsetSeconds);
  const temperature = isMetric
    ? metrics.temperatureC
    : celsiusToFahrenheit(metrics.temperatureC);
  const feelsLike = isMetric
    ? metrics.feelsLikeC
    : celsiusToFahrenheit(metrics.feelsLikeC);
  const windSpeed = isMetric
    ? metrics.windSpeedMs
    : metersPerSecondToMilesPerHour(metrics.windSpeedMs);
  const temperatureUnit = isMetric ? '°C' : '°F';
  const windUnit = isMetric ? 'm/s' : 'mph';
  const countryName = formatCountryName(location.country);
  const conditionName = formatConditionName(condition.description, condition.icon);

  return (
    <section className="weather-card glass-panel" aria-labelledby={titleId}>
      <header className="weather-card__heading">
        <div>
          <h2 id={titleId}>
            {location.city}
            {countryName && (
              <>
                {', '}
                <span>{countryName}</span>
              </>
            )}
          </h2>
          {observationDate && (
            <p className="weather-card__date">
              <time dateTime={observedAt}>{observationDate}</time>
            </p>
          )}
        </div>

        <button
          aria-label={`Cambiar al sistema ${isMetric ? 'imperial' : 'métrico'}`}
          aria-pressed={!isMetric}
          className="unit-toggle"
          onClick={() => setIsMetric((currentValue) => !currentValue)}
          type="button"
        >
          <span className={isMetric ? 'unit-toggle__option is-active' : 'unit-toggle__option'}>°C</span>
          <span className={!isMetric ? 'unit-toggle__option is-active' : 'unit-toggle__option'}>°F</span>
        </button>
      </header>

      <div className="weather-card__summary">
        <p
          aria-label={`${formatNumber(temperature)} grados ${isMetric ? 'Celsius' : 'Fahrenheit'}`}
          aria-live="polite"
          className="weather-card__temperature"
        >
          {formatNumber(temperature)}
          <span aria-hidden="true">°</span>
        </p>
        <WeatherIcon code={condition.icon} />
        <div className="weather-card__condition-group">
          <p className="weather-card__condition">{conditionName}</p>
          <p className="weather-card__feels-like">
            Sensación térmica {formatNumber(feelsLike)}{temperatureUnit}
          </p>
        </div>
      </div>

      <dl className="weather-card__metrics">
        <WeatherMetric
          label="Humedad"
          type="humidity"
          unit="%"
          value={formatNumber(metrics.humidity)}
        />
        <WeatherMetric
          label="Viento"
          type="wind"
          unit={windUnit}
          value={formatNumber(windSpeed)}
        />
        <WeatherMetric
          label="Presión"
          type="pressure"
          unit="hPa"
          value={formatNumber(metrics.pressureHpa)}
        />
        <WeatherMetric
          label="Nubosidad"
          type="cloudiness"
          unit="%"
          value={formatNumber(metrics.cloudiness)}
        />
      </dl>

    </section>
  );
}

const finiteNumber = (props, propName, componentName) => {
  if (!Number.isFinite(props[propName])) {
    return new Error(`${propName} debe ser un número finito en ${componentName}.`);
  }

  return null;
};

const timezoneOffset = (props, propName, componentName) => {
  if (!isTimezoneOffsetSeconds(props[propName])) {
    return new Error(`${propName} debe ser un desplazamiento UTC válido en ${componentName}.`);
  }

  return null;
};

WeatherCard.propTypes = {
  weather: PropTypes.shape({
    condition: PropTypes.shape({
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    metrics: PropTypes.shape({
      cloudiness: finiteNumber,
      feelsLikeC: finiteNumber,
      humidity: finiteNumber,
      pressureHpa: finiteNumber,
      temperatureC: finiteNumber,
      windSpeedMs: finiteNumber,
    }).isRequired,
    observedAt: PropTypes.string.isRequired,
    timezoneOffsetSeconds: timezoneOffset,
  }).isRequired,
};

export default WeatherCard;
