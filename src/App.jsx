import SearchForm from './components/SearchForm';
import StatusNotice from './components/StatusNotice';
import WeatherCard from './components/WeatherCard';
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

  return (
    <div className="app">
      <main className="app__shell" aria-busy={isBusy}>
        <header className="hero">
          <p className="hero__eyebrow">Clima en tiempo real</p>
          <h1>Tu clima, sin complicaciones</h1>
          <p className="hero__description">
            Consulta las condiciones actuales de cualquier ciudad o usa tu ubicación cuando tú decidas.
          </p>
        </header>

        <section className="search-panel" aria-labelledby="weather-search-title">
          <h2 id="weather-search-title" className="sr-only">
            Buscar el clima
          </h2>
          <SearchForm disabled={isBusy} onSearch={searchByCity} />

          <div className="search-panel__divider" aria-hidden="true">
            <span>o</span>
          </div>

          <button
            className="button button--secondary"
            disabled={isBusy}
            onClick={useCurrentLocation}
            type="button"
          >
            <LocationIcon />
            Usar mi ubicación
          </button>
          <p className="search-panel__privacy">
            Solo solicitaremos acceso a tu ubicación al pulsar el botón.
          </p>
        </section>

        <StatusNotice error={error} hasData={Boolean(weather)} onRetry={retry} status={status} />

        {weather ? (
          <WeatherCard weather={weather} />
        ) : (
          status === 'idle' && (
            <section className="empty-state" aria-label="Información de la aplicación">
              <div>
                <span aria-hidden="true">01</span>
                <h2>Elige una ciudad</h2>
                <p>Busca por nombre sin compartir tu ubicación.</p>
              </div>
              <div>
                <span aria-hidden="true">02</span>
                <h2>Datos claros</h2>
                <p>Temperatura, viento, humedad, presión y nubosidad.</p>
              </div>
              <div>
                <span aria-hidden="true">03</span>
                <h2>Control de unidades</h2>
                <p>Cambia entre el sistema métrico e imperial.</p>
              </div>
            </section>
          )
        )}

        <footer className="app__footer">
          Datos meteorológicos proporcionados por OpenWeather.
        </footer>
      </main>
    </div>
  );
}

export default App;
