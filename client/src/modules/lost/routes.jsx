// Pages of the lost module.
import { LostHomePage } from './LostHomePage.jsx';
import { ReportLostPage } from './pages/ReportLostPage.jsx';
import { ReportDetailPage } from './pages/ReportDetailPage.jsx';

export default [
  { path: '/lost', element: <LostHomePage /> },
  { path: '/lost/new', element: <ReportLostPage /> },
  { path: '/lost/:id', element: <ReportDetailPage /> },
];
