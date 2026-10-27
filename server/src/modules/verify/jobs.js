// Starts the hourly lifecycle job with node-cron. index.js calls startJobs() from
// init(), so it runs only in the real server, never during tests.
// The rules themselves live in services/lifecycle.js.
import cron from 'node-cron';
import { runLifecycle } from './services/lifecycle.js';

// Run the lifecycle rules at minute 0 of every hour.
export function startJobs() {
  // Cron pattern "0 * * * *" = minute 0, every hour, every day.
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await runLifecycle();
      console.log('[verify] lifecycle', result);
    } catch (err) {
      console.error('[verify] lifecycle failed', err);
    }
  });
}
