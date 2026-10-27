// Menu items of the verify module (Member 2), collected by app/moduleDiscovery.js.
// Shape: [{ label, path, roles, order }]. Lower order numbers appear first.

export default [
  {
    label: 'My claims',
    path: '/verify',
    roles: ['student', 'staff', 'handler', 'admin'],
    order: 30,
  },
  { label: 'Desk', path: '/verify/desk', roles: ['handler', 'admin'], order: 40 },
  { label: 'Analytics', path: '/verify/analytics', roles: ['admin'], order: 50 },
  { label: 'Flags', path: '/verify/flags', roles: ['admin'], order: 60 },
];
