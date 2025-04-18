import { describe, test, expect, vi, beforeEach } from 'vitest';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getMessaging, onMessage } from 'firebase/messaging';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Messaging } from 'firebase/messaging';
import { NotificationPayload, CustomMessagePayload, PushNotificationEventName } from '../src/types/fcm';

describe('FCM Notifications', () => {
  let db: Firestore;
  let messaging: Messaging;

  beforeEach(async () => {
    const app: FirebaseApp = initializeApp({ projectId: 'sami-app' });
    db = getFirestore(app);
    messaging = getMessaging(app);

    // Mock des fonctions Capacitor
    vi.spyOn(PushNotifications, 'register').mockResolvedValue(undefined);
    vi.spyOn(PushNotifications, 'addListener').mockImplementation((event: PushNotificationEventName, callback: (data: Token) => void) => {
      if (event === 'registration') {
        callback({ value: 'fcm_token_123' });
      }
      return Promise.resolve({ remove: vi.fn() });
    });
  });

  test('enregistre un token FCM valide', async () => {
    const mockToken: Token = { value: 'fcm_token_123' };
    vi.spyOn(PushNotifications, 'register').mockResolvedValue(undefined);
    vi.spyOn(PushNotifications, 'addListener').mockImplementation((event: PushNotificationEventName, callback: (data: Token) => void) => {
      if (event === 'registration') {
        callback(mockToken);
      }
      return Promise.resolve({ remove: vi.fn() });
    });

    await setupCapacitor(db);
    const userDoc = await getDoc(doc(db, 'users', 'alice'));
    expect(userDoc.data()?.pushToken).toBe('fcm_token_123');
  });

  test('gère la réception d\'une notification', async () => {
    const notification: NotificationPayload = {
      notification: {
        title: 'Test Notification',
        body: 'Ceci est un test',
      },
      data: {
        type: 'test',
        id: '123',
      },
    };

    let receivedNotification: CustomMessagePayload | null = null;
    onMessage(messaging, (payload: CustomMessagePayload) => {
      receivedNotification = payload;
    });

    // Simuler la réception d'une notification
    await simulateFCMNotification(notification, messaging);

    expect(receivedNotification).not.toBeNull();
    expect(receivedNotification?.notification?.title).toBe('Test Notification');
    expect(receivedNotification?.notification?.body).toBe('Ceci est un test');
    expect(receivedNotification?.data?.type).toBe('test');
  });

  test('gère les notifications multilingues', async () => {
    const notification: NotificationPayload = {
      notification: {
        title: {
          fr: 'Rappel',
          en: 'Reminder',
          ar: 'تذكير',
        },
        body: {
          fr: 'Votre rendez-vous',
          en: 'Your appointment',
          ar: 'موعدك',
        },
      },
      data: {
        type: 'appointment',
        id: '123',
      },
    };

    let receivedNotification: CustomMessagePayload | null = null;
    onMessage(messaging, (payload: CustomMessagePayload) => {
      receivedNotification = payload;
    });

    await simulateFCMNotification(notification, messaging);

    expect(receivedNotification).not.toBeNull();
    expect(receivedNotification?.notification?.title?.fr).toBe('Rappel');
    expect(receivedNotification?.notification?.title?.en).toBe('Reminder');
    expect(receivedNotification?.notification?.title?.ar).toBe('تذكير');
  });

  test('gère les actions de notification', async () => {
    const notification: NotificationPayload = {
      notification: {
        title: 'Action Test',
        body: 'Cliquez pour effectuer une action',
      },
      data: {
        type: 'action',
        actionId: 'test_action',
      },
    };

    let actionTriggered = false;
    onMessage(messaging, (payload: CustomMessagePayload) => {
      if (payload.data?.actionId === 'test_action') {
        actionTriggered = true;
      }
    });

    await simulateFCMNotification(notification, messaging);
    expect(actionTriggered).toBe(true);
  });

  test('gère les notifications avec images', async () => {
    const notification: NotificationPayload = {
      notification: {
        title: 'Image Test',
        body: 'Cette notification contient une image',
        image: 'https://example.com/image.jpg',
      },
      data: {
        type: 'image',
        id: '123',
      },
    };

    let receivedNotification: CustomMessagePayload | null = null;
    onMessage(messaging, (payload: CustomMessagePayload) => {
      receivedNotification = payload;
    });

    await simulateFCMNotification(notification, messaging);

    expect(receivedNotification).not.toBeNull();
    expect(receivedNotification?.notification?.image).toBe('https://example.com/image.jpg');
  });
});

// Fonctions utilitaires
async function setupCapacitor(db: Firestore) {
  await PushNotifications.register();
  PushNotifications.addListener('registration', (token: Token) => {
    // Enregistrer le token dans Firestore
    setDoc(doc(db, 'users', 'alice'), {
      pushToken: token.value,
    }, { merge: true });
  });
}

async function simulateFCMNotification(notification: NotificationPayload, messaging: Messaging) {
  // Simuler la réception d'une notification FCM
  const message = {
    ...notification,
    from: '1234567890',
    messageId: 'msg123',
  };
  // @ts-expect-error - Simuler l'événement onMessage
  messaging.onMessage(message);
} 