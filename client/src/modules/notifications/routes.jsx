// Pages of the notifications module (Member 1). The app router finds this file by
// itself (app/moduleDiscovery.js), so new pages are added here.
// Shape: [{ path, element, roles? }].
import { NotificationsPage } from './NotificationsPage.jsx';

export default [{ path: '/notifications', element: <NotificationsPage /> }];
