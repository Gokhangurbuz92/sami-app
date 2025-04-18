import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';
import { Capacitor } from '@capacitor/core';

// Configuration de Sentry
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        // Configuration du tracing
        tracePropagationTargets: ['localhost', /^https:\/\/api\.sami\.app/],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% des transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% des sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% des sessions avec erreurs
    // Environnement
    environment: process.env.NODE_ENV,
    // Version de l'application
    release: `sami@${process.env.REACT_APP_VERSION || '0.0.0'}`,
    // Configuration spécifique pour Capacitor
    enabled: Capacitor.isNativePlatform(),
  });
}

// Export des composants Sentry
export const ErrorBoundary = Sentry.ErrorBoundary;
export const withErrorBoundary = Sentry.withErrorBoundary;
export const withProfiler = Sentry.withProfiler;
export const useProfiler = Sentry.useProfiler;
export const Profiler = Sentry.Profiler;

// Export des fonctions utilitaires
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setExtra = Sentry.setExtra;
export const setContext = Sentry.setContext;

// Types pour les props des composants
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, componentStack: string) => void;
  showDialog?: boolean;
  dialogOptions?: {
    title?: string;
    subtitle?: string;
    subtitle2?: string;
    labelName?: string;
    labelEmail?: string;
    labelComments?: string;
    labelClose?: string;
    labelSubmit?: string;
    errorGeneric?: string;
    errorFormEntry?: string;
    successMessage?: string;
  };
}

export interface ProfilerProps {
  children: React.ReactNode;
  id: string;
  name?: string;
  onRender?: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<{ id: number; name: string; timestamp: number }>
  ) => void;
} 