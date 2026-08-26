import atmosLogo from '../assets/branding/atmos-logo.png';
import atmosSymbol from '../assets/branding/atmos-symbol.png';

function AppHeader() {
  return (
    <header className="app-header">
      <picture className="app-header__brand">
        <source media="(max-width: 35rem)" srcSet={atmosSymbol} />
        <img alt="ATMOS" className="app-header__logo" src={atmosLogo} />
      </picture>
      <p className="app-header__descriptor">
        <span aria-hidden="true" />
        Clima en tiempo real
      </p>
    </header>
  );
}

export default AppHeader;
