// Menu items of the found module (Member 3), collected by app/moduleDiscovery.js.
// Shape: [{ label, path, roles, order }]. Lower order numbers appear first.

export default [
  { label: 'Found', path: '/found', roles: ['student', 'staff', 'handler', 'admin'], order: 20 },
  {
    label: 'Post found item',
    path: '/found/new',
    roles: ['student', 'staff', 'handler', 'admin'],
    order: 21,
  },
];
