// Pages of the lost module (Member 1). The app router finds this file by itself
// (app/moduleDiscovery.js), so new pages are added here, never in a shared router.
// Shape: [{ path, element, roles? }]. All paths start with /lost.
// /lost/new is listed before /lost/:id so "new" is never read as a report id.
import { LostHomePage } from './LostHomePage.jsx';
import { ReportLostPage } from './pages/ReportLostPage.jsx';
import { ReportDetailPage } from './pages/ReportDetailPage.jsx';

export default [
  { path: '/lost', element: <LostHomePage /> },
  { path: '/lost/new', element: <ReportLostPage /> },
  { path: '/lost/:id', element: <ReportDetailPage /> },
];
