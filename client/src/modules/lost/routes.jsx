// Pages of the lost module (Member 1). The app router finds this file by itself
// (app/moduleDiscovery.js), so new pages are added here, never in a shared router.
// Shape: [{ path, element, roles? }]. All paths start with /lost.
import { LostHomePage } from './LostHomePage.jsx';

export default [{ path: '/lost', element: <LostHomePage /> }];
