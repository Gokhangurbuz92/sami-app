import * as SentryReact from '@sentry/react';
import { init, showReportDialog, withScope, captureException, captureMessage, setUser, captureEvent } from '@sentry/browser';
import { BrowserTracing } from '@sentry/browser';
import { Event, EventHint, Scope, User, SeverityLevel } from '@sentry/types';
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundaryWrapper = ({ children }: ErrorBoundaryProps): React.ReactElement => {
  if (process.env.NODE_ENV === 'production') {
    return React.createElement(
      SentryReact.ErrorBoundary,
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
    init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event: Event, hint?: EventHint) {
        if (event.level === 'error') {
          showReportDialog({ eventId: event.event_id });
        }
        return event;
      }
    });
  } else {
    init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event: Event, hint?: EventHint) {
        if (event.level === 'error') {
          showReportDialog({ eventId: event.event_id });
        }
        return event;
      }
    });
  }
};

export const captureError = (error: Error) => {
  withScope((scope: Scope) => {
    captureException(error);
  });
};

export const captureMessageWithLevel = (message: string, level: SeverityLevel = 'info') => {
  captureMessage(message, level);
};

export const setUserData = (user: User | null) => {
  setUser(user);
};

export const clearUser = () => {
  setUser(null);
};

export const captureExceptionWithReturn = (error: Error): string => {
  return captureException(error);
};

export const captureEventWithReturn = (event: Record<string, unknown>): string => {
  return captureEvent(event);
};

export default ErrorBoundaryWrapper;