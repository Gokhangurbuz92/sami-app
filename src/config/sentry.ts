import * as Sentry from '@sentry/react';
import { Capacitor } from '@capacitor/core';
import { init as sentryCapacitorInit } from '@sentry/capacitor';

// Initialiser Sentry pour le suivi des erreurs
export const initSentry = () => {
  // Vérifier si la variable d'environnement Sentry est définie
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  // Configuration commune pour web et mobile
  const config = {
    dsn,
    // Nous utiliserons des intégrations de base pour éviter les erreurs d'importation
    // Les intégrations avancées peuvent être ajoutées après avoir obtenu les bonnes dépendances
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: `sami-app@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
  };

  // Initialisation spécifique à la plateforme
  if (Capacitor.isNativePlatform()) {
    // Initialisation pour les plateformes natives (iOS, Android)
    sentryCapacitorInit(config);
  } else {
    // Initialisation pour le web
    Sentry.init(config);
  }
};

// Fonction utilitaire pour capturer une erreur manuellement
export const captureException = (error: any, context?: Record<string, any>) => {
  Sentry.captureException(error, { 
    contexts: { 
      custom: context 
    } 
  });
};

// Fonction utilitaire pour enregistrer un message
export const captureMessage = (message: string, level?: Sentry.SeverityLevel) => {
  Sentry.captureMessage(message, level);
};

// Fonction utilitaire pour définir des informations utilisateur
export const setUserInfo = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Fonction utilitaire pour effacer les informations utilisateur (logout)
export const clearUserInfo = () => {
  Sentry.setUser(null);
}; 