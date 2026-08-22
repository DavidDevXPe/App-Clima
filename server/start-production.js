import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST || '127.0.0.1';

if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT debe ser un número entero entre 1 y 65535.');
}

createApp({ nodeEnv: 'production' }).listen(port, host, () => {
  console.log(`Servidor de producción disponible en http://${host}:${port}`);
});
