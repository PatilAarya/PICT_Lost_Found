// The auth module: email one-time-code login, roles and the dev user switcher.
// Mounted automatically at /api/auth by app.js. The routes live in routes.js and
// the code rules in loginCodes.js. Frozen after Phase 0 (keeper: Member 2).
import router from './routes.js';

export default {
  name: 'auth',
  router,
  // Nothing to register: other modules use shared/middleware/requireAuth directly.
  async init() {},
};
