// The notifications module (Member 1): saved alerts, live updates and a few emails.
// Mounted automatically at /api/notifications by app.js. init() replaces the logging
// stub of services.notify with the real one, so every module's notify() call is now
// saved, pushed live over Socket.IO, and emailed when it needs action.
import { registerService } from '../../shared/services/registry.js';
import router from './routes.js';
import { createNotify } from './notify.js';

export default {
  name: 'notifications',
  router,
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init({ io }) {
    registerService('notify', createNotify(io));
  },
};
