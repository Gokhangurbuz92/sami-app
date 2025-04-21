import * as Sentry from '@sentry/capacitor';
import { BrowserTracing } from '@sentry/browser';

// Variable pour identifier l'environnement de développement
const isDev = process.env.NODE_ENV === 'development';

// Types pour Sentry
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Initialisation de Sentry pour Capacitor - utilisé pour les applications mobiles (Android/iOS)
export const initSentryCapacitor = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enableNativeCrashHandling: true,
      enableNativeNagger: true,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      attachStacktrace: true,
      attachScreenshot: true,
      debug: false
    });
  } else {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enableNativeCrashHandling: true,
      enableNativeNagger: true,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      attachStacktrace: true,
      attachScreenshot: true,
      debug: true
    });
  }

  // Ajouter un breadcrumb pour indiquer que l'application a démarré
  Sentry.addBreadcrumb({
    category: 'app',
    message: 'Application started',
    level: 'info',
  });
};

// Fonction utilitaire pour capturer les exceptions
export const captureError = (error: Error) => {
  Sentry.withScope((scope: any) => {
    Sentry.captureException(error);
  });
};

// Fonction utilitaire pour capturer les messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// Fonction utilitaire pour ajouter des breadcrumbs (miettes de pain) pour tracer le parcours utilisateur
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Fonction utilitaire pour définir le contexte utilisateur
export const setUser = (user: Sentry.User | null) => {
  Sentry.setUser(user);
};

// Fonction utilitaire pour effacer le contexte utilisateur (lors de la déconnexion)
export const clearUser = () => {
  Sentry.setUser(null);
};

// Exporter le module complet pour une utilisation avancée
export { Sentry }; 