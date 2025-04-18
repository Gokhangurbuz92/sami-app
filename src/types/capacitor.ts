declare module '@capacitor/core' {
  interface CapacitorGlobal {
    getApp(): {
      version: string;
      build: string;
    };
  }
}

declare module '@capacitor/toast' {
  export interface Toast {
    show(options: { text: string; duration?: 'short' | 'long' }): Promise<void>;
  }
}

declare module '@capacitor/splash-screen' {
  export interface SplashScreen {
    show(): Promise<void>;
    hide(): Promise<void>;
  }
}

declare module '@capacitor/status-bar' {
  export interface StatusBar {
    setStyle(options: { style: Style }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
  }

  export type Style = 'DARK' | 'LIGHT' | 'DEFAULT';
}

declare module '@capacitor/browser' {
  export interface Browser {
    open(options: { url: string }): Promise<void>;
    close(): Promise<void>;
  }
} 