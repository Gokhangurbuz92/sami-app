import * as Sentry from '@sentry/capacitor';
import { Integrations } from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';
import { Capacitor } from '@capacitor/core';

const SENTRY_DSN = 'a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408';

export const initSentryCapacitor = () => {
  const platform = Capacitor.getPlatform();
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new CaptureConsole({
          levels: ['error']
        })
      ],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      dist: platform,
      enableAutoSessionTracking: true,
      autoSessionTracking: true,
      attachStacktrace: true,
      debug: false,
      enableNative: true
    });
  } else {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new CaptureConsole({
          levels: ['error', 'warn']
        })
      ],
      tracesSampleRate: 1.0,
      environment: 'development',
      dist: platform,
      enableAutoSessionTracking: true,
      autoSessionTracking: true,
      attachStacktrace: true,
      debug: true,
      enableNative: true
    });
  }
};

export const captureNativeException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureNativeMessage = (message: string, level?: Sentry.SeverityLevel) => {
  Sentry.captureMessage(message, level);
};

export const setNativeUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearNativeUserContext = () => {
  Sentry.setUser(null);
}; 