import { useId, useState } from 'react';
import PropTypes from 'prop-types';
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

function parseObservation(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatObservationDate(date) {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date);
}

function formatObservedAt(date) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function WeatherCard({ weather }) {
  const [isMetric, setIsMetric] = useState(true);
  const titleId = useId();
  const { condition, location, metrics, observedAt } = weather;
  const observation = parseObservation(observedAt);
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

  return (
    <section className="weather-card glass-panel" aria-labelledby={titleId}>
      <header className="weather-card__heading">
        <div>
          <p className="weather-card__label">Condiciones actuales</p>
          <h2 id={titleId}>
            {location.city}
            {location.country && (
              <>
                {', '}
                <span>{location.country}</span>
              </>
            )}
          </h2>
          {observation && (
            <p className="weather-card__date">
              <time dateTime={observedAt}>{formatObservationDate(observation)}</time>
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
        <p className="weather-card__temperature" aria-live="polite">
          {formatNumber(temperature)}
          <span>{temperatureUnit}</span>
        </p>
        <WeatherIcon code={condition.icon} />
        <div className="weather-card__condition-group">
          <p className="weather-card__condition">{condition.description}</p>
          <p className="weather-card__feels-like">
            Sensación de {formatNumber(feelsLike)} {temperatureUnit}
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

      {observation && (
        <p className="weather-card__updated">
          Última actualización{' '}
          <time dateTime={observedAt}>{formatObservedAt(observation)}</time>
        </p>
      )}
    </section>
  );
}

const finiteNumber = (props, propName, componentName) => {
  if (!Number.isFinite(props[propName])) {
    return new Error(`${propName} debe ser un número finito en ${componentName}.`);
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
  }).isRequired,
};

export default WeatherCard;
