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
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getMessaging, getToken, onMessage, isSupported, MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '../config/firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Toast } from '@capacitor/toast';
import { init, captureException } from '@sentry/browser';
import type { Notification } from '../types/firebase';

// Types
type NotificationType = 'youth' | 'referent' | 'system';

// Initialize Sentry
init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE
});

interface NotificationData {
  userId: string;
  title: string;
  body: string;
  message: string;
  timestamp: Date;
  type: NotificationType;
  data?: {
    youthId?: string;
    referentId?: string;
  };
}

class NotificationService {
  private notificationsCollection = collection(db, 'notifications');

  async createNotification(notification: NotificationData): Promise<Notification> {
    try {
      const docRef = await addDoc(this.notificationsCollection, {
        ...notification,
        createdAt: Timestamp.fromDate(new Date()),
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
      if (Capacitor.getPlatform() !== 'web') {
        await Toast.show({
          text: `${title}: ${message}`,
          duration: 'long',
          position: 'bottom'
        });
      } else {
        // Fallback pour le web
        if ('Notification' in window) {
          await Notification.requestPermission();
          new Notification(title, { body: message });
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      captureException(error);
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
  if (Capacitor.getPlatform() !== 'web') {
    try {
      await PushNotifications.register();
      
      await PushNotifications.addListener('registration', 
        (token: { value: string }) => {
          console.log('Push registration success', token.value);
        }
      );
      
      await PushNotifications.addListener('registrationError',
        (error: any) => {
          console.error('Error on registration', error);
          captureException(error);
        }
      );
    } catch (error) {
      console.error('Error initializing notifications:', error);
      captureException(error);
    }
  }
};