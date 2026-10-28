// Route for the dev gallery, only in development.
import { DevUiPage } from './DevUiPage.jsx';

const devRoutes = [{ path: '/devui', element: <DevUiPage /> }];

export default import.meta.env.DEV ? devRoutes : [];
