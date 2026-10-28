// Menu items for the verify pages.
export default [
  {
    label: 'My claims',
    path: '/verify',
    roles: ['student', 'staff', 'handler', 'admin'],
    order: 30,
  },
  { label: 'Desk', path: '/verify/desk', roles: ['handler', 'admin'], order: 40 },
  { label: 'Analytics', path: '/verify/analytics', roles: ['handler', 'admin'], order: 50 },
  { label: 'History check', path: '/verify/integrity', roles: ['admin'], order: 55 },
  { label: 'Flags', path: '/verify/flags', roles: ['admin'], order: 60 },
];
