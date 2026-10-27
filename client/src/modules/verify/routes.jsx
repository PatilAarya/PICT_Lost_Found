// Pages of the verify module (Member 2). The app router finds this file by itself
// (app/moduleDiscovery.js), so new pages are added here, never in a shared router.
// Shape: [{ path, element, roles? }]. roles hides a page from everyone else.
import { VerifyPlaceholderPage } from './VerifyPlaceholderPage.jsx';

export default [
  { path: '/verify', element: <VerifyPlaceholderPage title="My claims" /> },
  {
    path: '/verify/desk',
    element: <VerifyPlaceholderPage title="Handler desk" />,
    roles: ['handler', 'admin'],
  },
  {
    path: '/verify/analytics',
    element: <VerifyPlaceholderPage title="Analytics" />,
    roles: ['admin'],
  },
  {
    path: '/verify/flags',
    element: <VerifyPlaceholderPage title="Flagged accounts" />,
    roles: ['admin'],
  },
];
