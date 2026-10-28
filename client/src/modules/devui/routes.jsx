// Route for the dev-only design system gallery (Member 1). There is no nav.js on
// purpose: it is not a real menu item. import.meta.env.DEV is true only while running
// `npm run dev`, so production builds leave this page out completely.
import { DevUiPage } from './DevUiPage.jsx';

const devRoutes = [{ path: '/devui', element: <DevUiPage /> }];

export default import.meta.env.DEV ? devRoutes : [];
