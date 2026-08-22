import PropTypes from 'prop-types';

function Sun({ isNight }) {
  if (isNight) {
    return <path className="weather-icon__moon" d="M72 23a29 29 0 1 0 23 43A25 25 0 0 1 72 23Z" />;
  }

  return (
    <g className="weather-icon__sun">
      <circle cx="63" cy="43" r="18" />
      <path d="M63 13v9M63 64v9M33 43h9M84 43h9M42 22l7 7M78 57l7 7M84 22l-7 7M49 57l-7 7" />
    </g>
  );
}

Sun.propTypes = {
  isNight: PropTypes.bool.isRequired,
};

function Cloud() {
  return (
    <path
      className="weather-icon__cloud"
      d="M33 81h54a15 15 0 0 0 2-30 27 27 0 0 0-51-5 18 18 0 0 0-5 35Z"
    />
  );
}

function WeatherIcon({ code }) {
  const condition = code.slice(0, 2);
  const isNight = code.endsWith('n');
  const hasCloud = ['02', '03', '04', '09', '10', '11', '13'].includes(condition);

  return (
    <svg
      aria-hidden="true"
      className="weather-card__icon weather-icon"
      focusable="false"
      viewBox="0 0 120 120"
    >
      {['01', '02', '10'].includes(condition) && <Sun isNight={isNight} />}
      {hasCloud && <Cloud />}
      {['09', '10'].includes(condition) && (
        <path className="weather-icon__rain" d="m42 91-5 10M61 91l-5 10M80 91l-5 10" />
      )}
      {condition === '11' && <path className="weather-icon__bolt" d="m64 84-11 18h10l-4 15 19-24H67l6-9Z" />}
      {condition === '13' && (
        <g className="weather-icon__snow">
          <circle cx="43" cy="98" r="3" />
          <circle cx="61" cy="105" r="3" />
          <circle cx="80" cy="97" r="3" />
        </g>
      )}
      {condition === '50' && (
        <path className="weather-icon__mist" d="M24 43h72M16 60h75M29 77h75M20 94h65" />
      )}
      {!['01', '02', '03', '04', '09', '10', '11', '13', '50'].includes(condition) && <Cloud />}
    </svg>
  );
}

WeatherIcon.propTypes = {
  code: PropTypes.string.isRequired,
};

export default WeatherIcon;
