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
  integrations: [Sentry.browserTracingIntegration()],
  tracePropagationTargets: ["https://myproject.org", /^\/api\//],
  // Informations sur l'environnement et la version
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',
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
      fallback={({ error }) => (
        <div className="error-boundary">
          <h2>Une erreur est survenue</h2>
          <p>{String(error)}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

// Exportation par défaut pour permettre l'import dans main.tsx
export default ErrorBoundaryWrapper; 