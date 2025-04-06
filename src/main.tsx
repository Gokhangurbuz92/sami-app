import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';
import './index.css';
import './styles/calendar.css';
import { registerSW } from 'virtual:pwa-register';
import { initSentry } from './config/sentry';

// Initialiser Sentry pour le suivi des erreurs
initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Enregistrement du service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Voulez-vous mettre à jour ?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("L'application est prête pour une utilisation hors ligne");
  }
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
