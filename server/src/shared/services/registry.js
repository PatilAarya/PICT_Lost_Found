// The service registry: the only way modules call each other.
// Example: Found calls services.runMatching({ foundItemId }) without importing Lost.
// Each function starts as a harmless STUB that logs and returns a safe value. When the
// owning module loads, its init() calls registerService() to swap in the real one.
// Always call services.name(...) at the moment you need it (do not copy it earlier),
// so you get the real version once it has been registered.

// Stub versions, used until the real module registers its own.
const stubs = {
  // notifications module: send a notification to one user.
  async notify({ userId, type, title }) {
    console.log(`[stub notify] ${type} to ${userId}: ${title}`);
  },
  // lost module: find lost reports that match a newly saved found item.
  async runMatching({ foundItemId }) {
    console.log(`[stub runMatching] found item ${foundItemId}`);
    return [];
  },
  // verify module: add a line to the custody log of a found item.
  async appendCustody({ itemId, action, actorId, note, meta }) {
    console.log(`[stub appendCustody] ${action} on ${itemId}`);
    return { itemId, action, actorId, note, meta, at: new Date(), stub: true };
  },
  // found module: the hidden-detail questions for a category.
  getHiddenDetailPrompts(category) {
    console.log(`[stub getHiddenDetailPrompts] ${category}`);
    return [
      { promptKey: 'unique_mark', promptText: 'Describe one mark only the owner would know.' },
    ];
  },
};

export const services = { ...stubs };

// Replace a stub with a module's real function. Unknown names are a mistake, so we stop.
export function registerService(name, implementation) {
  if (!(name in stubs)) {
    throw new Error(`Unknown service "${name}". Add it to docs/CONTRACT.md first.`);
  }
  services[name] = implementation;
}

// Put every stub back (used by tests so one test does not affect another).
export function resetServices() {
  Object.assign(services, stubs);
}
