import PropTypes from 'prop-types';

function MetricIcon({ type }) {
  if (type === 'humidity') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M12 3.2S6.8 9.1 6.8 14a5.2 5.2 0 0 0 10.4 0C17.2 9.1 12 3.2 12 3.2Z" />
        <path d="M9.8 15.2a2.4 2.4 0 0 0 2.4 2.1" />
      </svg>
    );
  }

  if (type === 'wind') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M3 8.4h10.6a2.6 2.6 0 1 0-2.3-3.8" />
        <path d="M3 12h15.2a2.8 2.8 0 1 1-2.5 4" />
        <path d="M3 15.6h7.1" />
      </svg>
    );
  }

  if (type === 'pressure') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.2" />
        <path d="m12 12 3.5-3.5M7.5 16.5h9" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M6.5 17.4h11a3.5 3.5 0 0 0 .5-7 5.7 5.7 0 0 0-10.6-1.2 4.1 4.1 0 0 0-.9 8.2Z" />
    </svg>
  );
}

MetricIcon.propTypes = {
  type: PropTypes.oneOf(['cloudiness', 'humidity', 'pressure', 'wind']).isRequired,
};

function WeatherMetric({ label, type, unit, value }) {
  return (
    <div className="weather-metric">
      <dt>
        <span className="weather-metric__icon">
          <MetricIcon type={type} />
        </span>
        {label}
      </dt>
      <dd>
        <span className="weather-metric__value">{value}</span>{' '}
        <span className="weather-metric__unit">{unit}</span>
      </dd>
    </div>
  );
}

WeatherMetric.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['cloudiness', 'humidity', 'pressure', 'wind']).isRequired,
  unit: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default WeatherMetric;
