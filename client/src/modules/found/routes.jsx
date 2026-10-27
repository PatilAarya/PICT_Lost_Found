import { FoundHomePage } from './FoundHomePage.jsx';
import PostFoundItemPage from './pages/PostFoundItemPage.jsx';
import MyFoundItemsPage from './pages/MyFoundItemsPage.jsx';

export default [
  { path: '/found', element: <FoundHomePage /> },
  { path: '/found/new', element: <PostFoundItemPage /> },
  { path: '/found/mine', element: <MyFoundItemsPage /> },
];