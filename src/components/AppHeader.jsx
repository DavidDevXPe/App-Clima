import atmosLogo from '../assets/branding/atmos-logo.png';
import atmosSymbol from '../assets/branding/atmos-symbol.png';
import PropTypes from 'prop-types';

function RefreshIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M19.2 8.4A7.7 7.7 0 1 0 20 13" />
      <path d="M19.2 4.8v3.6h-3.6" />
    </svg>
  );
}

function formatUpdateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-PE', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function AppHeader({ observedAt }) {
  const updateTime = observedAt ? formatUpdateTime(observedAt) : null;

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
};

export default AppHeader;
