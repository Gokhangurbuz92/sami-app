import * as Sentry from '@sentry/react';
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundaryWrapper = ({ children }: ErrorBoundaryProps): React.ReactElement => {
  if (process.env.NODE_ENV === 'production') {
    return React.createElement(Sentry.ErrorBoundary, {
      fallback: React.createElement('div', null, 'Une erreur est survenue'),
      children
    });
  }
  return React.createElement(React.Fragment, null, children);
};

if (process.env.NODE_ENV === 'production' && process.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN as string,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info'): string => {
  if (process.env.NODE_ENV === 'production') {
    try {
      return Sentry.captureMessage(message, level) || 'unknown-event-id';
    } catch {
      return 'error-event-id';
    }
  }
  console.log(`[Sentry Mock] ${level}: ${message}`);
  return 'mock-event-id';
};

export const captureException = (error: Error): string => {
  if (process.env.NODE_ENV === 'production') {
    try {
      return Sentry.captureException(error) || 'unknown-event-id';
    } catch {
      return 'error-event-id';
    }
  }
  console.error('[Sentry Mock] Error:', error);
  return 'mock-event-id';
};

export const captureEvent = (event: Record<string, unknown>): string => {
  if (process.env.NODE_ENV === 'production') {
    try {
      return Sentry.captureEvent(event) || 'unknown-event-id';
    } catch {
      return 'error-event-id';
    }
  }
  console.log('[Sentry Mock] Event:', event);
  return 'mock-event-id';
};

export default ErrorBoundaryWrapper;