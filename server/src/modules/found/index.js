// The found module (Member 3): found items, image upload and desk suggestion.
// Mounted automatically at /api/found by app.js. Routes live in routes.js;
// the hidden-detail questions and desk logic live in their own files.
import router from './routes.js';
import { registerService } from '../../shared/services/registry.js';
import { getHiddenDetailPrompts } from './hidden-detail-prompts.js';

export default {
  name: 'found',
  router,
  // Called once by server.js after start-up. Swaps the stub
  // getHiddenDetailPrompts for the real one, so Verify's owner-check
  // screens get real questions instead of the generic stub text.
  async init() {
    registerService('getHiddenDetailPrompts', getHiddenDetailPrompts);
  },
};