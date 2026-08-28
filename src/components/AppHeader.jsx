import atmosLogo from '../assets/branding/atmos-logo.png';
import atmosSymbol from '../assets/branding/atmos-symbol.png';
import PropTypes from 'prop-types';
import { formatWeatherTime } from '../utils/formatWeatherDateTime';

function RefreshIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M19.2 8.4A7.7 7.7 0 1 0 20 13" />
      <path d="M19.2 4.8v3.6h-3.6" />
    </svg>
  );
}

function AppHeader({ observedAt, timezoneOffsetSeconds }) {
  const updateTime = observedAt
    ? formatWeatherTime(observedAt, timezoneOffsetSeconds)
    : null;

  return (
    <header className="app-header">
      <picture className="app-header__brand">
        <source media="(max-width: 35rem)" srcSet={atmosSymbol} />
        <img alt="ATMOS" className="app-header__logo" src={atmosLogo} />
      </picture>
      {updateTime ? (
        <p className="app-header__update">
          <RefreshIcon />
          <span>
            Actualizado: <time dateTime={observedAt}>{updateTime}</time>
          </span>
        </p>
      ) : (
        <p className="app-header__descriptor">
          <span aria-hidden="true" />
          Clima en tiempo real
        </p>
      )}
    </header>
  );
}

AppHeader.propTypes = {
  observedAt: PropTypes.string,
  timezoneOffsetSeconds: PropTypes.number,
};

export default AppHeader;
