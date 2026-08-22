import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather, WeatherApiError } from '../services/weatherApi';

const REQUEST_TIMEOUT_MS = 12_000;
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60 * 1000,
  timeout: 10_000,
};

const initialState = {
  data: null,
  error: null,
  status: 'idle',
};

function geolocationErrorMessage(error) {
  if (error?.code === 1) {
    return 'No concediste permiso para usar tu ubicación. Puedes buscar una ciudad manualmente.';
  }

  if (error?.code === 2) {
    return 'No fue posible determinar tu ubicación. Comprueba la conexión o busca una ciudad.';
  }

  if (error?.code === 3) {
    return 'La solicitud de ubicación tardó demasiado. Inténtalo nuevamente.';
  }

  return 'No fue posible acceder a tu ubicación en este dispositivo.';
}

function requestErrorMessage(error) {
  if (error instanceof WeatherApiError) {
    return error.message;
  }

  return 'Ocurrió un problema de conexión. Comprueba tu red e inténtalo nuevamente.';
}

export function useWeather() {
  const [state, setState] = useState(initialState);
  const activeControllerRef = useRef(null);
  const lastActionRef = useRef(null);
  const requestIdRef = useRef(0);

  const executeRequest = useCallback(async (query, requestId) => {
    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    setState((currentState) => ({
      ...currentState,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await fetchWeather(query, { signal: controller.signal });

      if (requestId === requestIdRef.current) {
        setState({ data, error: null, status: 'success' });
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (controller.signal.aborted && !timedOut) return;

      setState((currentState) => ({
        ...currentState,
        error: timedOut
          ? 'La consulta meteorológica tardó demasiado. Inténtalo nuevamente.'
          : requestErrorMessage(error),
        status: 'error',
      }));
    } finally {
      window.clearTimeout(timeoutId);
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
    }
  }, []);

  const runQuery = useCallback(
    (query) => {
      const requestId = ++requestIdRef.current;
      return executeRequest(query, requestId);
    },
    [executeRequest],
  );

  const searchByCity = useCallback(
    (city) => {
      const query = { city };
      lastActionRef.current = { type: 'query', value: query };
      return runQuery(query);
    },
    [runQuery],
  );

  const locateCurrentWeather = useCallback(() => {
    activeControllerRef.current?.abort();
    const requestId = ++requestIdRef.current;
    lastActionRef.current = { type: 'location' };

    if (!navigator.geolocation) {
      setState((currentState) => ({
        ...currentState,
        error: 'Tu navegador no admite geolocalización. Busca una ciudad manualmente.',
        status: 'error',
      }));
      return;
    }

    setState((currentState) => ({
      ...currentState,
      error: null,
      status: 'locating',
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== requestIdRef.current) return;

        executeRequest(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          requestId,
        );
      },
      (error) => {
        if (requestId !== requestIdRef.current) return;

        setState((currentState) => ({
          ...currentState,
          error: geolocationErrorMessage(error),
          status: 'error',
        }));
      },
      GEOLOCATION_OPTIONS,
    );
  }, [executeRequest]);

  const retry = useCallback(() => {
    const lastAction = lastActionRef.current;

    if (lastAction?.type === 'location') {
      locateCurrentWeather();
    } else if (lastAction?.type === 'query') {
      runQuery(lastAction.value);
    }
  }, [locateCurrentWeather, runQuery]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      activeControllerRef.current?.abort();
    },
    [],
  );

  return {
    ...state,
    isBusy: state.status === 'loading' || state.status === 'locating',
    retry,
    searchByCity,
    useCurrentLocation: locateCurrentWeather,
  };
}
