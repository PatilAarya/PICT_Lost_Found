// Test settings for the server.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 120000,
    testTimeout: 30000,
    fileParallelism: false,
  },
});
