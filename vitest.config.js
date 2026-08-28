import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      exclude: ['src/main.jsx'],
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 60,
        functions: 75,
        lines: 70,
        statements: 70,
      },
    },
    environment: 'jsdom',
    fileParallelism: false,
    maxWorkers: 1,
    pool: 'forks',
    restoreMocks: true,
    setupFiles: './src/test/setup.js',
  },
});
