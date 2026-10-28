// Pages of the found module.
import { Navigate } from 'react-router-dom';
import { FoundHomePage } from './FoundHomePage.jsx';
import PostFoundItemPage from './pages/PostFoundItemPage.jsx';

export default [
  { path: '/found', element: <FoundHomePage /> },
  { path: '/found/new', element: <PostFoundItemPage /> },
  { path: '/found/mine', element: <Navigate to="/found" replace /> },
];
