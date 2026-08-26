# Clima Ahora

Aplicación meteorológica responsive y accesible construida con React. Permite buscar una ciudad o solicitar la ubicación del dispositivo de forma explícita, consultar las condiciones actuales y cambiar de manera coherente entre unidades métricas e imperiales.

La clave de OpenWeather se utiliza únicamente en el servidor: nunca se incluye en el bundle del navegador.

## Funcionalidades

- Búsqueda por ciudad y consulta opcional por geolocalización.
- Estados visibles de carga, error, reintento y éxito.
- Temperatura y sensación térmica en °C/°F; viento en m/s o mph.
- Respuesta de OpenWeather validada y convertida a un modelo estable.
- Proxy Express con timeout, caché, deduplicación y límite de solicitudes.
- Cabeceras de seguridad y Content Security Policy mediante Helmet.
- Navegación por teclado, foco visible, anuncios accesibles y movimiento reducido.
- Pruebas de componentes, flujo de usuario y API.
- CI y actualizaciones automáticas de dependencias con GitHub Actions y Dependabot.

## Requisitos

- Node.js 24.15 o superior.
- Una clave activa de [OpenWeather](https://openweathermap.org/api).

> La clave que anteriormente estaba incluida en el código fuente debe revocarse y reemplazarse, ya que permanece en el historial de Git.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env` y sustituye el valor de ejemplo:

   ```dotenv
   OPENWEATHER_API_KEY=tu_nueva_clave
   PORT=8787
   HOST=127.0.0.1
   ```

   `.env` está ignorado por Git. No uses una variable `VITE_*` para la clave: ese prefijo expone el valor al navegador.

3. Inicia el frontend y la API:

   ```bash
   npm run dev
   ```

   - Interfaz: `http://localhost:5173`
   - API: `http://127.0.0.1:8787`

La geolocalización del navegador funciona en `localhost` y, al desplegar, requiere HTTPS.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite y la API en paralelo. |
| `npm run build` | Genera el frontend de producción en `dist`. |
| `npm start` | Sirve `dist` y `/api` desde Express. |
| `npm run preview` | Construye e inicia el servidor de producción. |
| `npm run lint` | Ejecuta ESLint sin permitir advertencias. |
| `npm test` | Ejecuta toda la suite una vez. |
| `npm run test:watch` | Ejecuta las pruebas en modo interactivo. |
| `npm run test:coverage` | Genera cobertura en `coverage`. |
| `npm run check` | Ejecuta lint, pruebas y build en secuencia. |

## Producción

```bash
npm run build
npm start
```

El despliegue debe ejecutar el servidor Node, no alojar únicamente los archivos estáticos, porque `/api/weather` protege la clave. Configura `OPENWEATHER_API_KEY` como secreto del entorno de despliegue, establece `HOST=0.0.0.0` cuando la plataforma lo requiera y termina HTTPS delante del servidor.

### Vercel

Los entrypoints `api/weather.js` y `api/health.js` publican la aplicación Express existente como Vercel Functions. Son adaptadores delgados: validación, normalización, timeout, caché, rate limit y errores permanecen centralizados en `server/`.

En **Project Settings → Environment Variables**, configura `OPENWEATHER_API_KEY` para **Production** y **Preview**. No uses el prefijo `VITE_` y no copies la clave a ningún archivo versionado. Después de crear o actualizar la variable, genera un nuevo despliegue para que la función reciba el secreto.

Vercel detecta automáticamente ambos archivos dentro de `api/`; este proyecto no necesita rewrites ni `vercel.json`. Tras desplegar, comprueba:

- `https://weather-clima.vercel.app/api/health`
- `https://weather-clima.vercel.app/api/weather?city=Paita`

Variables opcionales del servidor:

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `PORT` | `8787` | Puerto HTTP. |
| `HOST` | `127.0.0.1` | Interfaz de red; usa `0.0.0.0` en contenedores/plataformas que lo requieran. |
| `WEATHER_API_TIMEOUT_MS` | `8000` | Timeout de OpenWeather. |
| `WEATHER_CACHE_TTL_MS` | `300000` | Duración de caché en memoria. |
| `WEATHER_CACHE_MAX_ENTRIES` | `250` | Máximo de consultas cacheadas. |
| `WEATHER_RATE_LIMIT_WINDOW_MS` | `60000` | Ventana del limitador. |
| `WEATHER_RATE_LIMIT_MAX_REQUESTS` | `60` | Peticiones por cliente y ventana. |

## API interna

- `GET /api/weather?city=Lima`
- `GET /api/weather?lat=-12.0464&lon=-77.0428`
- `GET /api/health`

La API acepta una ciudad o el par completo de coordenadas, pero nunca ambos. Los parámetros desconocidos, repetidos o fuera de rango se rechazan antes de contactar a OpenWeather.

## Estructura

```text
api/
  health.js          Adaptador Vercel para el health check
  weather.js         Adaptador Vercel para la API meteorológica
src/
  components/       Interfaz, búsqueda, estados e iconos
  hooks/            Flujo asíncrono, geolocalización y cancelación
  services/         Cliente y validación del contrato interno
  test/             Configuración y datos de prueba
server/
  app.js             Rutas, seguridad y archivos de producción
  weather-service.js OpenWeather, normalización, caché y timeout
  validation.js      Validación de consultas
  rate-limit.js      Protección básica de cuota
```

## Seguridad

- Nunca confirmes `.env` ni vuelvas a incluir claves en `src`.
- Rota cualquier clave que haya aparecido previamente en Git.
- Mantén las dependencias actualizadas y ejecuta periódicamente `npm audit`.
- El limitador y la caché actuales viven en memoria. Para múltiples instancias, utiliza un almacén compartido como Redis y aplica límites también en el proxy o plataforma de despliegue.
