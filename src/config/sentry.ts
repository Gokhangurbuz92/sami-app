import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';
import { Hub } from '@sentry/core';
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundaryWrapper = ({ children }: ErrorBoundaryProps): React.ReactElement => {
  if (process.env.NODE_ENV === 'production') {
    return React.createElement(
      Sentry.ErrorBoundary,
      null,
      React.createElement('div', null,
        React.createElement('div', null, 'Une erreur est survenue'),
        children
      )
    );
  }
  return React.createElement(React.Fragment, null, children);
};

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        if (event.level === 'error') {
          Sentry.showReportDialog({ eventId: event.event_id });
        }
        return event;
      }
    });
  } else {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        if (event.level === 'error') {
          Sentry.showReportDialog({ eventId: event.event_id });
        }
        return event;
      }
    });
  }
};

export const captureError = (error: Error) => {
  Sentry.withScope((scope) => {
    scope.setLevel('error');
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: Sentry.User | null) => {
  Sentry.setUser(user);
};

export const clearUser = () => {
  Sentry.setUser(null);
};

export const captureException = (error: Error): string => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const hub = new Hub();
      const eventId = hub.captureException(error);
      return eventId || 'unknown-event-id';
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
      const hub = new Hub();
      const eventId = hub.captureEvent(event);
      return eventId || 'unknown-event-id';
    } catch {
      return 'error-event-id';
    }
  }
  console.log('[Sentry Mock] Event:', event);
  return 'mock-event-id';
};

export default ErrorBoundaryWrapper;