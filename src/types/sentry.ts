declare module '@sentry/react' {
  export interface SentryInit {
    dsn: string;
    environment?: string;
    beforeSend?: (event: any) => any;
  }

  export interface Sentry {
    init(options: SentryInit): void;
    showReportDialog(options: { eventId: string }): void;
    withScope(callback: (scope: any) => void): void;
    captureException(error: Error): void;
    captureMessage(message: string, level?: SeverityLevel): void;
    setUser(user: { id: string; email?: string } | null): void;
  }

  export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
}

declare module '@sentry/capacitor' {
  export interface SentryCapacitor {
    init(options: { dsn: string }): void;
    captureException(error: Error): void;
    captureMessage(message: string, level?: string): void;
  }
} 