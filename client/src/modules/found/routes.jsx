// Pages of the found module. The app router finds this file by itself
// (app/moduleDiscovery.js). /found/mine is kept for old links and sends people to
// /found, which now shows "your found items" itself.
import { Navigate } from 'react-router-dom';
import { FoundHomePage } from './FoundHomePage.jsx';
import PostFoundItemPage from './pages/PostFoundItemPage.jsx';

export default [
  { path: '/found', element: <FoundHomePage /> },
  { path: '/found/new', element: <PostFoundItemPage /> },
  { path: '/found/mine', element: <Navigate to="/found" replace /> },
];
