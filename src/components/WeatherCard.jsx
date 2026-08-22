import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import WeatherIcon from './WeatherIcon';
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

function formatObservedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function WeatherCard({ weather }) {
  const [isMetric, setIsMetric] = useState(true);
  const titleId = useId();
  const { condition, location, metrics, observedAt } = weather;
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
  const formattedObservation = formatObservedAt(observedAt);

  return (
    <section className="weather-card" aria-labelledby={titleId}>
      <div className="weather-card__heading">
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
      </div>

      <div className="weather-card__summary">
        <WeatherIcon code={condition.icon} />
        <div>
          <p className="weather-card__temperature" aria-live="polite">
            {formatNumber(temperature)}
            <span>{temperatureUnit}</span>
          </p>
          <p className="weather-card__condition">{condition.description}</p>
          <p className="weather-card__feels-like">
            Sensación de {formatNumber(feelsLike)} {temperatureUnit}
          </p>
        </div>
      </div>

      <dl className="weather-card__metrics">
        <div>
          <dt>Viento</dt>
          <dd>
            {formatNumber(windSpeed)} <span>{windUnit}</span>
          </dd>
        </div>
        <div>
          <dt>Humedad</dt>
          <dd>
            {formatNumber(metrics.humidity)} <span>%</span>
          </dd>
        </div>
        <div>
          <dt>Presión</dt>
          <dd>
            {formatNumber(metrics.pressureHpa)} <span>hPa</span>
          </dd>
        </div>
        <div>
          <dt>Nubosidad</dt>
          <dd>
            {formatNumber(metrics.cloudiness)} <span>%</span>
          </dd>
        </div>
      </dl>

      {formattedObservation && (
        <p className="weather-card__updated">
          Actualizado <time dateTime={observedAt}>{formattedObservation}</time>
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
