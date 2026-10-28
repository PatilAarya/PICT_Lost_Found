// Starts the hourly lifecycle job.
import cron from 'node-cron';
import { runLifecycle } from './services/lifecycle.js';

export function startJobs() {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await runLifecycle();
      console.log('[verify] lifecycle', result);
    } catch (err) {
      console.error('[verify] lifecycle failed', err);
    }
  });
}
