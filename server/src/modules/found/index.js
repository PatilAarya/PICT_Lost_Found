// The found module: found items, photos and desk suggestions.
import router from './routes.js';
import { registerService } from '../../shared/services/registry.js';
import { getHiddenDetailPrompts } from './hidden-detail-prompts.js';

export default {
  name: 'found',
  router,
  async init() {
    registerService('getHiddenDetailPrompts', getHiddenDetailPrompts);
  },
};
