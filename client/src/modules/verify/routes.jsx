// Pages of the verify module (Member 2). The app router finds this file by itself
// (app/moduleDiscovery.js), so new pages are added here, never in a shared router.
// Shape: [{ path, element, roles? }]. roles hides a page from everyone else
// (the server checks the role again on every API call).
import './verify.css';
import './verify-charts.css';
import { MyClaimsPage } from './pages/MyClaimsPage.jsx';
import { NewClaimPage } from './pages/NewClaimPage.jsx';
import { ClaimPage } from './pages/ClaimPage.jsx';
import { DeskPage } from './pages/DeskPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { IntegrityPage } from './pages/IntegrityPage.jsx';
import { FlagsPage } from './pages/FlagsPage.jsx';

export default [
  { path: '/verify', element: <MyClaimsPage /> },
  { path: '/verify/claim/new', element: <NewClaimPage /> },
  { path: '/verify/claim/:id', element: <ClaimPage /> },
  { path: '/verify/desk', element: <DeskPage />, roles: ['handler', 'admin'] },
  { path: '/verify/analytics', element: <AnalyticsPage />, roles: ['handler', 'admin'] },
  { path: '/verify/integrity', element: <IntegrityPage />, roles: ['admin'] },
  { path: '/verify/flags', element: <FlagsPage />, roles: ['admin'] },
];
