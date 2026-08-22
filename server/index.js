import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import app from "./app.js";

export const DEFAULT_PORT = 8787;

function readPort(value) {
  const port = Number(value ?? DEFAULT_PORT);

  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
  }

  return port;
}

export function startServer({
  application = app,
  port = readPort(process.env.PORT),
  host = process.env.HOST || "127.0.0.1",
} = {}) {
  return application.listen(port, host, () => {
    console.log(`Servidor disponible en http://${host}:${port}`);
  });
}

const entryPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;

if (entryPath === import.meta.url) {
  startServer();
}
