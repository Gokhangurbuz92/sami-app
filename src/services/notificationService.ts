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
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseApp from '../config/firebase';

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  userId: string;
  link?: string;
  data?: Record<string, string | number | boolean>;
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

const messaging = getMessaging(firebaseApp);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

interface FirebaseMessage {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
  };
  data?: Record<string, string>;
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
    
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error requesting notification permission:', error.message);
    }
    return null;
  }
};

export const onMessageListener = (callback: (payload: NotificationPayload) => void) => {
  try {
    return onMessage(messaging, (payload: FirebaseMessage) => {
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
    }
    return () => {};
  }
};
