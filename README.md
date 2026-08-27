# ATMOS

Aplicación meteorológica responsive y accesible construida con React. Su identidad visual adapta fondos, overlays y acentos al estado del clima, con una portada clara y una tarjeta de resultados compacta para consultar la información esencial sin distracciones.

Permite buscar una ciudad o solicitar la ubicación del dispositivo de forma explícita, consultar las condiciones actuales y cambiar de manera coherente entre unidades métricas e imperiales.

La clave de OpenWeather se utiliza únicamente en el servidor: nunca se incluye en el bundle del navegador.

## Demo

[https://atmos-clima.netlify.app/](https://atmos-clima.netlify.app/)

## Funcionalidades

- Búsqueda por ciudad y consulta opcional por geolocalización.
- Estados visibles de carga, error, reintento y éxito.
- Temperatura y sensación térmica en °C/°F; viento en m/s o mph.
- Temas atmosféricos para cielo despejado, noche, nubes, lluvia, tormenta, nieve y niebla.
- Interfaz glass, responsive y optimizada para móvil, tablet y escritorio.
- Respuesta de OpenWeather validada y convertida a un modelo estable.
- Proxy Express con timeout, caché, deduplicación y límite de solicitudes.
- Cabeceras de seguridad y Content Security Policy mediante Helmet.
- Navegación por teclado, foco visible, anuncios accesibles y movimiento reducido.
- Pruebas de componentes, flujo de usuario y API.
- CI y actualizaciones automáticas de dependencias con GitHub Actions y Dependabot.

## Requisitos

- Node.js 24.15 o superior.
- Una clave activa de [OpenWeather](https://openweathermap.org/api).

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

## Despliegue actual en Netlify

La versión pública está desplegada en [Netlify](https://atmos-clima.netlify.app/). Vite genera el frontend estático (`dist`) y `netlify/functions/api.mjs` publica la API como Netlify Function, envolviendo la aplicación Express con `serverless-http`.

Esta función es un adaptador delgado de la aplicación Express existente: validación, normalización, timeout, caché, rate limit y errores permanecen centralizados en `server/`.

`netlify.toml` define el build (`npm run build` → `dist`), el directorio de funciones y los redirects: `/api/*` se reescribe hacia la función y `/*` cae en `index.html` para el enrutado del SPA.

En **Site configuration → Environment variables**, configura `OPENWEATHER_API_KEY`. No uses el prefijo `VITE_` y no copies la clave a ningún archivo versionado. Después de crear o actualizar la variable, dispara un nuevo despliegue para que la función reciba el secreto.

Tras desplegar, comprueba:

- `https://atmos-clima.netlify.app/api/health`
- `https://atmos-clima.netlify.app/api/weather?city=Paita`

`npm run preview` permite comprobar localmente el build de producción. `npm start` conserva la opción de servir `dist` y `/api` desde un proceso Node autogestionado, pero no forma parte del despliegue actual en Netlify.

El proyecto también conserva `api/weather.js` y `api/health.js` (adaptadores para Vercel Functions) por si se despliega ahí en el futuro; no se usan en el despliegue de Netlify.

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

- Nunca versiones `.env` ni incluyas claves en `src`.
- Revoca y reemplaza de inmediato cualquier clave que llegue a exponerse.
- Mantén las dependencias actualizadas y ejecuta periódicamente `npm audit`.
- El limitador y la caché actuales viven en memoria. Para múltiples instancias, utiliza un almacén compartido como Redis y aplica límites también en el proxy o plataforma de despliegue.
