import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';
import { captureException, captureMessage } from '@sentry/capacitor';
import { initializeNotifications } from './notificationService';

/**
 * Service centralisé pour la gestion des plugins Capacitor
 * Il offre une interface unifiée pour tous les plugins utilisés dans l'application
 */

// Initialiser tous les plugins Capacitor au démarrage de l'application
export const initializeCapacitorPlugins = async (): Promise<void> => {
  try {
    // Vérifier si nous sommes sur une plateforme native
    if (Capacitor.isNativePlatform()) {
      console.log('Initializing Capacitor plugins for native platform');
      
      // Initialiser le StatusBar (Android/iOS)
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#3880ff' });
        await StatusBar.setStyle({ style: Style.Dark });
      } else if (Capacitor.getPlatform() === 'ios') {
        await StatusBar.setStyle({ style: Style.Dark });
      }
      
      // Masquer le SplashScreen après un délai
      setTimeout(() => {
        SplashScreen.hide();
      }, 2000);
      
      // Initialiser les notifications push
      await initializeNotifications();
      
      // Capture information dans Sentry
      captureMessage('Capacitor plugins initialized successfully', {
        level: 'info',
        tags: {
          platform: Capacitor.getPlatform(),
          version: Capacitor.getApp().version
        }
      });
    } else {
      console.log('Running in web environment, some native features will not be available');
      
      // Initialiser les notifications web si possible
      await initializeNotifications();
    }
  } catch (error) {
    console.error('Error initializing Capacitor plugins:', error);
    captureException(error);
  }
};

/**
 * Utilitaires pour Toast
 */
export const showToast = async (message: string, duration: 'short' | 'long' = 'short'): Promise<void> => {
  try {
    await Toast.show({
      text: message,
      duration
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
};

/**
 * Utilitaires pour Browser
 */
export const openBrowser = async (url: string, windowName?: string): Promise<void> => {
  try {
    await Browser.open({
      url,
      windowName: windowName || 'SAMI App',
      presentationStyle: 'popover'
    });
  } catch (error) {
    console.error('Error opening browser:', error);
    captureException(error);
    
    // Fallback à l'ouverture d'un nouvel onglet si le plugin échoue
    window.open(url, '_blank');
  }
};

/**
 * Vérifier si l'application est en mode natif (Android/iOS)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Obtenir la plateforme actuelle
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Obtenir les informations de l'application
 */
export const getAppInfo = () => {
  return Capacitor.getApp();
}; 