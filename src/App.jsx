import AppHeader from './components/AppHeader';
import SearchForm from './components/SearchForm';
import StatusNotice from './components/StatusNotice';
import WeatherBackground from './components/WeatherBackground';
import WeatherCard from './components/WeatherCard';
import { DEFAULT_WEATHER_THEME, getWeatherTheme } from './config/weatherThemes';
import { useWeather } from './hooks/useWeather';
import './App.css';

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function App() {
  const {
    data: weather,
    error,
    isBusy,
    status,
    retry,
    searchByCity,
    useCurrentLocation,
  } = useWeather();
  const hasWeather = Boolean(weather);
  const weatherTheme = hasWeather
    ? getWeatherTheme(weather.condition.icon)
    : DEFAULT_WEATHER_THEME;

  return (
    <div
      className={`app ${hasWeather ? 'app--weather' : 'app--welcome'}`}
      style={{ '--weather-accent': weatherTheme.accent }}
    >
      <WeatherBackground theme={weatherTheme} />

      <main className="app__shell" aria-busy={isBusy}>
        <AppHeader
          observedAt={weather?.observedAt}
          timezoneOffsetSeconds={weather?.timezoneOffsetSeconds}
        />

        {!hasWeather && (
          <section className="hero" aria-labelledby="welcome-title">
            <p className="hero__eyebrow">Tu atmósfera. Ahora.</p>
            <h1 id="welcome-title">
              Tu clima,{' '}
              <span>sin complicaciones</span>
            </h1>
            <p className="hero__description">
              Condiciones actuales y datos claros para cualquier ciudad, en el momento que los necesitas.
            </p>
          </section>
        )}

        <section
          className={`search-panel glass-panel${hasWeather ? ' search-panel--compact' : ''}`}
          aria-labelledby="weather-search-title"
        >
          <h2 id="weather-search-title" className="sr-only">
            Buscar el clima
          </h2>
          <SearchForm disabled={isBusy} onSearch={searchByCity} />

          <div className="search-panel__location">
            <button
              className="button button--secondary"
              disabled={isBusy}
              onClick={useCurrentLocation}
              type="button"
            >
              <LocationIcon />
              <span className="button__label button__label--location">
                {hasWeather ? 'Mi ubicación' : 'Usar mi ubicación'}
              </span>
            </button>
            {!hasWeather && (
              <p className="search-panel__privacy">
                Tu ubicación solo se solicita al pulsar este botón.
              </p>
            )}
          </div>
        </section>

        <StatusNotice error={error} hasData={hasWeather} onRetry={retry} status={status} />

        {hasWeather ? (
          <WeatherCard weather={weather} />
        ) : (
          status === 'idle' && (
            <section className="empty-state" aria-label="Información de la aplicación">
              <div className="glass-panel">
                <span aria-hidden="true">01</span>
                <h2>Elige una ciudad</h2>
                <p>Busca por nombre y consulta el clima sin compartir tu ubicación.</p>
              </div>
              <div className="glass-panel">
                <span aria-hidden="true">02</span>
                <h2>Datos claros</h2>
                <p>Temperatura, viento, humedad y presión en una sola vista.</p>
              </div>
              <div className="glass-panel">
                <span aria-hidden="true">03</span>
                <h2>Control de unidades</h2>
                <p>Cambia al instante entre el sistema métrico e imperial.</p>
              </div>
            </section>
          )
        )}

        <footer className={`app__footer${hasWeather ? ' app__footer--weather glass-panel' : ''}`}>
          <span aria-hidden="true" />
          Datos meteorológicos proporcionados por OpenWeather
        </footer>
      </main>
    </div>
  );
}

export default App;
