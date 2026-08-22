import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { weatherFixture } from './test/fixtures';

function jsonResponse(payload, ok = true) {
  return {
    json: vi.fn().mockResolvedValue(payload),
    ok,
  };
}

describe('App', () => {
  it('espera una acción explícita antes de pedir ubicación o consultar la API', () => {
    const getCurrentPosition = vi.fn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    render(<App />);

    expect(screen.getByRole('heading', { name: /tu clima, sin complicaciones/i })).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('busca una ciudad y presenta el resultado', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: weatherFixture }));
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: /buscar por ciudad/i }), 'Lima');
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(await screen.findByRole('heading', { name: /Lima, PE/i })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/weather?city=Lima');
  });

  it('mantiene disponible la búsqueda cuando se deniega la geolocalización', async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }));
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    render(<App />);
    await user.click(screen.getByRole('button', { name: /usar mi ubicación/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no concediste permiso/i);
    expect(screen.getByRole('searchbox', { name: /buscar por ciudad/i })).toBeEnabled();
  });

  it('rechaza una búsqueda vacía sin llamar a la API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(await screen.findByText(/al menos dos caracteres/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('muestra un error seguro cuando la API devuelve datos incompletos', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: {} })));

    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: /buscar por ciudad/i }), 'Lima');
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/datos meteorológicos.*incompletos/i);
  });
});
