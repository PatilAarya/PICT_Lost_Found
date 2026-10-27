// Pages of the found module (Member 3). The app router finds this file by itself
// (app/moduleDiscovery.js), so new pages are added here, never in a shared router.
// Shape: [{ path, element, roles? }]. All paths start with /found.
import { FoundHomePage } from './FoundHomePage.jsx';

export default [{ path: '/found', element: <FoundHomePage /> }];
