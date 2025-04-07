export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  data?: {
    [key: string]: string;
  };
  userId?: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
} 