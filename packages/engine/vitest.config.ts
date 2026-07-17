import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@eden/core': path.resolve(__dirname, '../core/src'),
      '@eden/citizen': path.resolve(__dirname, '../citizen/src'),
      '@eden/ai': path.resolve(__dirname, '../ai/src'),
      '@eden/history': path.resolve(__dirname, '../history/src'),
    },
  },
});
