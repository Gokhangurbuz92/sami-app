import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { Browser } from '@capacitor/browser';
import { init as sentryInit, captureException, captureMessage } from '@sentry/react-native';
import { BrowserTracing } from '@sentry/tracing';
import { initializeNotifications } from './notificationService';

// Initialiser Sentry avec le tracing
sentryInit({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

/**
 * Service centralisé pour la gestion des plugins Capacitor
 * Il offre une interface unifiée pour tous les plugins utilisés dans l'application
 */

// Initialiser tous les plugins Capacitor au démarrage de l'application
export const initializeCapacitor = async () => {
  try {
    const isNative = await App.isNativePlatform();
    
    if (isNative) {
      const platform = await App.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
        await StatusBar.setStyle({ style: 'DARK' });
      }
      
      await SplashScreen.hide();
    }
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

/**
 * Utilitaires pour Toast
 */
export const showToast = async (message: string) => {
  try {
    await Toast.show({
      text: message,
      duration: 'long'
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
};

/**
 * Utilitaires pour Browser
 */
export const openBrowser = async (url: string) => {
  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('Error opening browser:', error);
  }
};

/**
 * Vérifier si l'application est en mode natif (Android/iOS)
 */
export const isNativePlatform = async () => {
  try {
    return await App.isNativePlatform();
  } catch (error) {
    console.error('Error checking native platform:', error);
    return false;
  }
};

/**
 * Obtenir la plateforme actuelle
 */
export const getPlatform = async () => {
  try {
    return await App.getPlatform();
  } catch (error) {
    console.error('Error getting platform:', error);
    return 'web';
  }
};

/**
 * Obtenir les informations de l'application
 */
export const getAppInfo = async () => {
  try {
    const appInfo = await App.getInfo();
    return {
      id: appInfo.id,
      name: appInfo.name,
      version: appInfo.version,
      build: appInfo.build,
      platform: appInfo.platform
    };
  } catch (error) {
    console.error('Error getting app info:', error);
    return null;
  }
};

export const showErrorToast = async (message: string) => {
  try {
    await Toast.show({
      text: message,
      duration: 'long'
    });
  } catch (error) {
    console.error('Error showing error toast:', error);
  }
};

export const openExternalUrl = async (url: string) => {
  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('Error opening external URL:', error);
  }
};

export class CapacitorService {
  static async initialize(): Promise<void> {
    try {
      await initializeNotifications();

      // Vérifier si nous sommes sur une plateforme native
      if (App.isNativePlatform()) {
        const platform = await App.getPlatform();
        
        // Configurer la barre de statut
        if (platform === 'android') {
          await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
        }
        await StatusBar.setStyle({ style: 'DARK' });

        // Masquer l'écran de démarrage
        await SplashScreen.hide();

        // Capture information dans Sentry
        const appInfo = await App.getInfo();
        captureMessage('Capacitor plugins initialized successfully', {
          level: 'info',
          tags: {
            platform: appInfo.platform,
            version: appInfo.version,
            build: appInfo.build
          }
        });
      }
    } catch (error) {
      console.error('Error initializing Capacitor plugins:', error);
      captureException(error);
    }
  }

  static async showToast(message: string, duration: 'short' | 'long' = 'short') {
    try {
      await Toast.show({
        text: message,
        duration: duration
      });
    } catch (error) {
      captureException(error);
      console.error('Error showing toast:', error);
    }
  }

  static async openBrowser(url: string) {
    try {
      await Browser.open({ url });
    } catch (error) {
      captureException(error);
      console.error('Error opening browser:', error);
    }
  }

  static async getAppInfo() {
    try {
      return await App.getInfo();
    } catch (error) {
      captureException(error);
      console.error('Error getting app info:', error);
      return null;
    }
  }
} 