import { Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

export interface NotificationPayload {
  notification: {
    title: string | { [key: string]: string };
    body: string | { [key: string]: string };
    image?: string;
  };
  data: {
    type: string;
    id?: string;
    actionId?: string;
  };
}

export interface CustomMessagePayload {
  notification?: {
    title?: string | { [key: string]: string };
    body?: string | { [key: string]: string };
    image?: string;
  };
  data?: {
    type?: string;
    id?: string;
    actionId?: string;
  };
}

export type PushNotificationEventName = 'registration' | 'registrationError' | 'pushNotificationReceived' | 'pushNotificationActionPerformed';

export type PushNotificationEventData = Token | ActionPerformed | PushNotificationSchema;

export interface PushNotificationListener {
  (event: PushNotificationEventName, callback: (data: PushNotificationEventData) => void): Promise<{ remove: () => void }>;
} 