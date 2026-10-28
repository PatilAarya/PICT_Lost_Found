// Lets modules call each other without importing each other.
const stubs = {
  async notify({ userId, type, title }) {
    console.log(`[stub notify] ${type} to ${userId}: ${title}`);
  },
  async runMatching({ foundItemId }) {
    console.log(`[stub runMatching] found item ${foundItemId}`);
    return [];
  },
  async appendCustody({ itemId, action, actorId, note, meta }) {
    console.log(`[stub appendCustody] ${action} on ${itemId}`);
    return { itemId, action, actorId, note, meta, at: new Date(), stub: true };
  },
  getHiddenDetailPrompts(category) {
    console.log(`[stub getHiddenDetailPrompts] ${category}`);
    return [
      { promptKey: 'unique_mark', promptText: 'Describe one mark only the owner would know.' },
    ];
  },
};

export const services = { ...stubs };

export function registerService(name, implementation) {
  if (!(name in stubs)) {
    throw new Error(`Unknown service "${name}". Add it to docs/CONTRACT.md first.`);
  }
  services[name] = implementation;
}

export function resetServices() {
  Object.assign(services, stubs);
}
