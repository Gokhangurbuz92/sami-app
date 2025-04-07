/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'workbox-window' {
  export interface WorkboxOptions {
    serviceWorker: string;
    immediate?: boolean;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
  }

  export class Workbox {
    constructor(options: WorkboxOptions);
    register(): Promise<ServiceWorkerRegistration>;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Autres types PWA si nécessaire
export interface PWAUpdateEvent extends Event {
  registerSW: () => Promise<ServiceWorkerRegistration>;
}
