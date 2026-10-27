// Test settings for the server. The first run downloads a MongoDB binary for
// mongodb-memory-server, so start-up hooks get a generous time limit.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 120000,
    testTimeout: 30000,
    // Test files share one in-memory MongoDB per file; run files one at a time.
    fileParallelism: false,
  },
});
