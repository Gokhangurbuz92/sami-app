declare module '@sentry/react' {
  import { ReactNode } from 'react';

  interface ErrorBoundaryProps {
    fallback: ReactNode;
    children: ReactNode;
  }

  interface SentryInit {
    dsn: string;
    integrations: any[];
    tracesSampleRate: number;
  }

  export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {}
  export function init(options: SentryInit): void;
}

declare module '@sentry/tracing' {
  export class BrowserTracing {
    constructor();
  }
} 