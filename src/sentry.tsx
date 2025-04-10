import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';
import { BrowserTracing } from '@sentry/browser';

const SENTRY_DSN = 'a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new CaptureConsole({
          levels: ['error']
        })
      ],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        if (event.exception) {
          Sentry.showReportDialog({ eventId: event.event_id });
        }
        return event;
      },
    });
  } else {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new CaptureConsole({
          levels: ['error', 'warn']
        })
      ],
      tracesSampleRate: 1.0,
      environment: 'development',
      beforeSend(event) {
        if (event.exception) {
          Sentry.showReportDialog({ eventId: event.event_id });
        }
        return event;
      },
      debug: true
    });
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level?: Sentry.SeverityLevel) => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearUserContext = () => {
  Sentry.setUser(null);
}; 