import * as Sentry from '@sentry/capacitor';
import { Capacitor } from '@capacitor/core';

// Variable pour identifier l'environnement de développement
const isDev = process.env.NODE_ENV === 'development';

// Types pour Sentry
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Initialisation de Sentry pour Capacitor - utilisé pour les applications mobiles (Android/iOS)
export const initSentryCapacitor = () => {
  Sentry.init({
    dsn: "https://a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408",
    // Intégrations simplifiées sans dépendances problématiques
    // tracesSampleRate au lieu d'intégrations spécifiques
    tracesSampleRate: isDev ? 1.0 : 0.2,
    // Activer le suivi des performances
    enableAutoPerformanceTracking: true,
    // Configuration de l'environnement
    environment: isDev ? 'development' : 'production',
    // Version de l'application
    release: process.env.npm_package_version || '1.0.0',
    // Configuration de la plateforme
    dist: Capacitor.getPlatform(),
    // Ajouter des tags automatiquement
    initialScope: {
      tags: {
        platform: Capacitor.getPlatform(),
        app: 'SAMI Firebase',
      },
    },
    // Désactiver l'envoi automatique des erreurs pour plus de contrôle
    autoSessionTracking: true,
    attachStacktrace: true,
    // Désactiver certaines fonctionnalités qui pourraient causer des problèmes sur mobile
    enableNative: true,
    enableNativeCrashHandling: true,
    // Enregistrer plus d'informations sur l'utilisateur et l'appareil
    sendDefaultPii: true,
    // Limite de données
    maxBreadcrumbs: 100,
  });

  // Ajouter un breadcrumb pour indiquer que l'application a démarré
  Sentry.addBreadcrumb({
    category: 'app',
    message: 'Application started',
    level: 'info',
  });
};

// Fonction utilitaire pour capturer les exceptions
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, { contexts: { customContext: context } });
};

// Fonction utilitaire pour capturer les messages
export const captureMessage = (message: string, level: SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// Fonction utilitaire pour ajouter des breadcrumbs (miettes de pain) pour tracer le parcours utilisateur
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Fonction utilitaire pour définir le contexte utilisateur
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Fonction utilitaire pour effacer le contexte utilisateur (lors de la déconnexion)
export const clearUser = () => {
  Sentry.setUser(null);
};

// Exporter le module complet pour une utilisation avancée
export { Sentry }; 