// Menu items of the found module, collected by app/moduleDiscovery.js.
// Shape: [{ label, path, roles, order }]. Lower order numbers appear first.
// One entry only: the Found page itself has the single "Post found item" button.

export default [
  { label: 'Found', path: '/found', roles: ['student', 'staff', 'handler', 'admin'], order: 20 },
];
