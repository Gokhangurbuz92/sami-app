import * as Sentry from '@sentry/react';
import { useEffect, ReactNode } from 'react';

// Déclaration des variables d'environnement
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      VITE_APP_VERSION: string;
    };
  }
}

// Initialisation de Sentry
Sentry.init({
  dsn: "https://a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% des transactions
  // Configuration des cibles pour le tracing distribué
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Configuration des replays pour capturer les interactions utilisateur avant une erreur
  replaysSessionSampleRate: 0.1, // Capture 10% des sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% des sessions avec erreur
  // Informations sur l'environnement et la version
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',
  // Métadonnées du projet
  dist: 'web',
  initialScope: {
    tags: {
      platform: 'web',
      app: 'SAMI Firebase',
    },
  },
});

// Composant ErrorBoundary
const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Capture des erreurs non gérées
    const handleError = (event: ErrorEvent) => {
      Sentry.captureException(event.error);
    };

    // Capture des rejets de promesses non gérés
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      Sentry.captureException(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div className="error-boundary">
          <h2>Une erreur est survenue</h2>
          <p>{error.toString()}</p>
          <button onClick={resetError}>Réessayer</button>
        </div>
      )}
      onError={(error, componentStack) => {
        Sentry.captureException(error, {
          contexts: { react: { componentStack } }
        });
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

// Exportation par défaut pour permettre l'import dans main.tsx
export default ErrorBoundaryWrapper; 