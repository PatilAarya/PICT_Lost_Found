// The notifications module: alerts, live updates and emails.
import { registerService } from '../../shared/services/registry.js';
import router from './routes.js';
import { createNotify } from './notify.js';

export default {
  name: 'notifications',
  router,
  async init({ io }) {
    registerService('notify', createNotify(io));
  },
};
