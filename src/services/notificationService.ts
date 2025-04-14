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
import { NotificationData } from '../types/notification';
import { getMessaging, getToken, onMessage, FirebaseMessaging, isSupported } from 'firebase/messaging';
import { firebaseApp } from '../config/firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Toast } from '@capacitor/toast';
import { captureMessage, captureException } from '@sentry/capacitor';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
  userId: string;
  data?: NotificationData;
}

export const notificationService = {
  // Créer une nouvelle notification
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ): Promise<Notification> {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: new Date()
    });

    return {
      id: notificationRef.id,
      ...notification,
      read: false,
      createdAt: new Date()
    };
  },

  // Marquer une notification comme lue
  async markAsRead(id: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, {
      read: true
    });
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('read', '==', false));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  },

  // Supprimer une notification
  async deleteNotification(id: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', id);
    await deleteDoc(notificationRef);
  },

  // Récupérer les notifications d'un utilisateur
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
      }
      throw new Error('An unknown error occurred while fetching notifications');
    }
  },

  // Écouter les notifications en temps réel
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Notification[];
      callback(notifications);
    });
  },

  // Créer une notification pour un rendez-vous
  async createAppointmentNotification(
    userId: string,
    appointmentId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      title,
      message,
      type: 'info',
      userId,
      link: `/appointments/${appointmentId}`,
      data: { appointmentId }
    });
  },

  // Créer une notification pour une note
  async createNoteNotification(
    userId: string,
    noteId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      title,
      message,
      type: 'info',
      userId,
      link: `/notes/${noteId}`,
      data: { noteId }
    });
  },

  // Créer une notification pour un jeune
  async createYouthNotification(
    userId: string,
    youthId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      title,
      message,
      type: 'info',
      userId,
      link: `/youth/${youthId}`,
      data: { youthId }
    });
  }
};

export const sendNotification = async (data: NotificationData) => {
  try {
    // Logique d'envoi de notification
    return await fetch('/api/notifications', {
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

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

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
          captureMessage('FCM Token received', {
            level: 'info',
            extra: { tokenFirstChars: token.value.substring(0, 10) }
          });
          // Ici on pourrait envoyer le token au backend
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
    captureException(error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const isMessagingSupported = await isSupported();
    
    if (!isMessagingSupported) {
      console.warn('Firebase Cloud Messaging is not supported in this browser');
      return null;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      console.log('FCM token obtained:', token);
      return token;
    }
    
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error requesting notification permission:', error.message);
      captureException(error);
    }
    return null;
  }
};

export const onMessageListener = (callback: (payload: NotificationPayload) => void) => {
  try {
    return onMessage(messaging, (payload: any) => {
      callback({
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        icon: payload.notification?.icon,
        data: payload.data
      });
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error setting up message listener:', error.message);
      captureException(error);
    }
    return () => {};
  }
};

// Fonction utilitaire pour tester les notifications dans le panneau d'administration
export const testPushNotification = async (): Promise<string> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Vérifier l'état des permissions
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive !== 'granted') {
        const newPermStatus = await PushNotifications.requestPermissions();
        if (newPermStatus.receive !== 'granted') {
          return 'Notifications refusées par l\'utilisateur';
        }
      }
      
      // Tester l'enregistrement
      await PushNotifications.register();
      return 'Test de notification push réussi, l\'appareil est enregistré pour recevoir des notifications';
    } else {
      // Test web
      const token = await requestNotificationPermission();
      if (token) {
        return `Token FCM obtenu: ${token.substring(0, 15)}...`;
      } else {
        return 'Impossible d\'obtenir le token FCM';
      }
    }
  } catch (error) {
    console.error('Erreur lors du test des notifications:', error);
    captureException(error);
    return `Erreur: ${error instanceof Error ? error.message : String(error)}`;
  }
};
