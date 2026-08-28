import serverless from 'serverless-http';

import { createApp } from '../../server/app.js';

const app = createApp({ nodeEnv: 'netlify' });

export const handler = serverless(app);
