import { App as CapApp } from '@capacitor/app';
import { StatusBar as CapStatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import { Toast as CapToast } from '@capacitor/toast';
import { Browser as CapBrowser } from '@capacitor/browser';
import * as Sentry from '@sentry/react';
import { initializeNotifications } from './notificationService';

/**
 * Service centralisé pour la gestion des plugins Capacitor
 * Il offre une interface unifiée pour tous les plugins utilisés dans l'application
 */

// Initialiser tous les plugins Capacitor au démarrage de l'application
export const initializeCapacitorPlugins = async (): Promise<void> => {
  try {
    // Vérifier si nous sommes sur une plateforme native
    if (CapApp.isNativePlatform()) {
      console.log('Initializing Capacitor plugins for native platform');
      
      // Initialiser le StatusBar (Android/iOS)
      const platform = await CapApp.getPlatform();
      if (platform === 'android') {
        await CapStatusBar.setBackgroundColor({ color: '#FFFFFF' });
      } else if (platform === 'ios') {
        await CapStatusBar.setStyle({ style: Style.Dark });
      }
      
      // Masquer le SplashScreen après un délai
      setTimeout(() => {
        CapSplashScreen.hide();
      }, 2000);
      
      // Initialiser les notifications push
      await initializeNotifications();
      
      // Capture information dans Sentry
      Sentry.captureMessage('Capacitor plugins initialized successfully', {
        level: 'info',
        tags: {
          platform: platform,
          version: CapApp.getApp().version
        }
      });
    } else {
      console.log('Running in web environment, some native features will not be available');
      
      // Initialiser les notifications web si possible
      await initializeNotifications();
    }
  } catch (error) {
    console.error('Error initializing Capacitor plugins:', error);
    Sentry.captureException(error as Error);
  }
};

/**
 * Utilitaires pour Toast
 */
export const showToast = async (message: string, duration: 'short' | 'long' = 'short'): Promise<void> => {
  try {
    await CapToast.show({
      text: message,
      duration: duration
    });
  } catch (error) {
    console.error('Error showing toast:', error);
    Sentry.captureException(error as Error);
  }
};

/**
 * Utilitaires pour Browser
 */
export const openBrowser = async (url: string, windowName?: string): Promise<void> => {
  try {
    await CapBrowser.open({
      url: url,
      toolbarColor: '#3880ff'
    });
  } catch (error) {
    console.error('Error opening browser:', error);
    Sentry.captureException(error as Error);
    
    // Fallback à l'ouverture d'un nouvel onglet si le plugin échoue
    window.open(url, '_blank');
  }
};

/**
 * Vérifier si l'application est en mode natif (Android/iOS)
 */
export const isNativePlatform = (): boolean => {
  return CapApp.isNativePlatform();
};

/**
 * Obtenir la plateforme actuelle
 */
export const getPlatform = (): string => {
  return CapApp.getPlatform();
};

/**
 * Obtenir les informations de l'application
 */
export const getAppInfo = async () => {
  try {
    return await CapApp.getInfo();
  } catch (error) {
    console.error('Error getting app info:', error);
    return null;
  }
};

export class CapacitorService {
  static async initialize() {
    try {
      const platform = await CapApp.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        await CapStatusBar.setBackgroundColor({ color: '#FFFFFF' });
        await CapStatusBar.setStyle({ style: Style.Dark });
        await CapSplashScreen.hide();
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error initializing Capacitor:', error);
    }
  }

  static async showToast(message: string, duration: 'short' | 'long' = 'short') {
    try {
      await CapToast.show({
        text: message,
        duration: duration
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error showing toast:', error);
    }
  }

  static async openBrowser(url: string) {
    try {
      await CapBrowser.open({ url });
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error opening browser:', error);
    }
  }

  static async getAppInfo() {
    try {
      return await CapApp.getInfo();
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error getting app info:', error);
      return null;
    }
  }
} 