// Root component: shows the login page or the app depending on who is logged in.
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthProvider.jsx';
import { useAuth } from '../shared/auth/useAuth.js';
import { RequireRole } from '../shared/auth/RequireRole.jsx';
import { Spinner, ToastProvider } from '../shared/ui/index.js';
import { getModuleRoutes } from './moduleDiscovery.js';
import { AppShell } from './AppShell.jsx';
import { HomePage } from './HomePage.jsx';
import { LoginPage } from './LoginPage.jsx';
import './app.css';

const moduleRoutes = getModuleRoutes();

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return <Spinner />;
  }
  if (!user) {
    return <LoginPage />;
  }
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        {moduleRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RequireRole roles={route.roles}>{route.element}</RequireRole>}
          />
        ))}
        <Route path="*" element={<p className="page">This page does not exist. Use the menu.</p>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
