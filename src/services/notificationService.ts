/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getMessaging, getToken, onMessage, isSupported, MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '../config/firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { ToastPlugin } from '@capacitor/toast';
import { init, captureException } from '@sentry/browser';
import type { Notification } from '../types/firebase';

// Initialize Sentry
init({
  dsn: process.env.SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

// Initialize Toast plugin
const Toast: ToastPlugin = {
  show: async (options) => {
    if (Capacitor.isNativePlatform()) {
      await Capacitor.Plugins.Toast.show(options);
    }
  }
};

class NotificationService {
  private notificationsCollection = collection(db, 'notifications');

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    try {
      const docRef = await addDoc(this.notificationsCollection, {
        ...notification,
        createdAt: new Date(),
        read: false
      });

      return {
        id: docRef.id,
        ...notification,
        createdAt: new Date(),
        read: false
      };
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(this.notificationsCollection, id), {
        read: true
      });
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(this.notificationsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async createYouthNotification(userId: string, youthId: string, title: string, message: string): Promise<Notification> {
    try {
      return await this.createNotification({
        userId,
        title,
        body: message,
        message,
        timestamp: new Date(),
        type: 'youth',
        data: { youthId }
      });
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async createReferentNotification(userId: string, referentId: string, title: string, message: string): Promise<Notification> {
    try {
      return await this.createNotification({
        userId,
        title,
        body: message,
        message,
        timestamp: new Date(),
        type: 'referent',
        data: { referentId }
      });
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async createSystemNotification(userId: string, title: string, message: string): Promise<Notification> {
    try {
      return await this.createNotification({
        userId,
        title,
        body: message,
        message,
        timestamp: new Date(),
        type: 'system'
      });
    } catch (error) {
      captureException(error as Error);
      throw error;
    }
  }

  async showNotification(title: string, message: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Toast.show({
          text: `${title}: ${message}`,
          duration: 'long'
        });
      }
    } catch (error) {
      captureException(error as Error);
    }
  }
}

export const notificationService = new NotificationService();

export const sendNotification = async (data: Record<string, unknown>) => {
  try {
    // Logique d'envoi de notification
    return await globalThis.fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Firebase Messaging pour le web
const messaging = getMessaging(firebaseApp);

/**
 * Initialise les notifications push pour les plateformes natives (Android/iOS)
 * et web via Firebase Cloud Messaging
 */
export const initializeNotifications = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Initialisation pour Android/iOS via Capacitor
      console.log('Initializing push notifications for native platform');
      
      // Demande des permissions
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        // Enregistrer les listeners avant l'enregistrement
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success: ', token.value);
          captureException(new Error(`FCM Token received: ${token.value.substring(0, 10)}`));
        });
        
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration failed: ', error);
          captureException(new Error(`Push registration failed: ${JSON.stringify(error)}`));
        });
        
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          // Afficher une notification en foreground
          Toast.show({
            text: notification.title || 'Nouvelle notification',
            duration: 'long'
          });
        });
        
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push notification action performed: ', action);
          // Naviguer vers la page appropriée selon la notification
          // Exemple: router.navigate(['/notifications']);
        });
        
        // Enregistrement pour recevoir les notifications
        await PushNotifications.register();
        console.log('Push notifications registered successfully');
      } else {
        console.warn('Push notification permission was denied');
      }
    } else {
      // Initialisation pour le web via Firebase Cloud Messaging
      await requestNotificationPermission();
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
    captureException(error as Error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!isSupported()) {
    console.warn('Firebase Messaging is not supported in this environment');
    return;
  }
  
  return onMessage(messaging, callback);
};

export const testPushNotification = async (): Promise<string> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.VITE_FIREBASE_VAPID_KEY
    });
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};
