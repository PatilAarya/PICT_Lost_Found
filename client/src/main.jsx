// Entry point of the client: loads the two self-hosted fonts and the global styles,
// then renders <App /> into the #root div in index.html.
// The service worker for the PWA is added automatically by vite-plugin-pwa.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/source-sans-3';
import './styles/tokens.css';
import './styles/base.css';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
