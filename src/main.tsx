import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';
import './index.css';
import './styles/calendar.css';
import { registerSW } from 'virtual:pwa-register';
import ErrorBoundaryWrapper from './config/sentry';
import { Capacitor } from '@capacitor/core';
import { initSentryCapacitor } from './config/sentryCapacitor';

// Initialisation de Sentry pour les plateformes natives (Android/iOS)
if (Capacitor.isNativePlatform()) {
  initSentryCapacitor();
}

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
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </React.StrictMode>
);
