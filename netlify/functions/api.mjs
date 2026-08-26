import serverless from "serverless-http";

import app from "../../server/app.js";

// Keep the .mjs extension: Netlify's esbuild bundler otherwise emits CJS,
// which turns import.meta.url (used in server/app.js) into undefined and
// crashes on load with "TypeError: Invalid URL".
//
// The redirect in netlify.toml maps /api/* to
// /.netlify/functions/api/api/:splat (note the doubled "api") so that after
// serverless-http strips the "/.netlify/functions/api" basePath, the path
// Express sees is "/api/<splat>" — matching the routes app.js already
// defines for the Vercel deployment, with no route changes needed here.
export const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
});
