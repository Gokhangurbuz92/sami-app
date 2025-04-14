#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des types de base ===${NC}"

# Configurer les types d'utilisateur
echo -e "${YELLOW}Configuration des types d'utilisateur...${NC}"
cat > src/types/user.ts << 'EOL'
export type UserRole = 'youth' | 'professional' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isOnline: boolean;
  fcmToken?: string;
}

export interface Youth extends User {
  birthDate: Date;
  nationality: string;
  medicalInfo?: string;
  schoolInfo?: string;
  schedule?: Schedule;
}

export interface Professional extends User {
  department: string;
  schedule?: Schedule;
}

export interface Schedule {
  appointments: Appointment[];
  classes: Class[];
  activities: Activity[];
}

export interface Appointment {
  id: string;
  type: 'medical' | 'legal' | 'other';
  date: Date;
  location: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Class {
  id: string;
  subject: string;
  day: string;
  time: string;
  location: string;
}

export interface Activity {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
}
EOL

# Configurer les types de chat
echo -e "${YELLOW}Configuration des types de chat...${NC}"
cat > src/types/chat.ts << 'EOL'
export type ChatType = 'private' | 'group' | 'professional';

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  participants: string[];
  createdAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  translatedContent?: {
    [key: string]: string;
  };
  attachments?: Attachment[];
  reactions?: {
    [emoji: string]: string[];
  };
  createdAt: Date;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface TypingIndicator {
  userId: string;
  chatId: string;
  isTyping: boolean;
}
EOL

# Configurer les types de notification
echo -e "${YELLOW}Configuration des types de notification...${NC}"
cat > src/types/notification.ts << 'EOL'
export type NotificationType = 'message' | 'appointment' | 'schedule' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    [key: string]: string;
  };
  recipientId: string;
  createdAt: Date;
  isRead: boolean;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: {
    [key: string]: string;
  };
}
EOL

# Configurer les types d'authentification
echo -e "${YELLOW}Configuration des types d'authentification...${NC}"
cat > src/types/auth.ts << 'EOL'
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
  role: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  code: string;
  newPassword: string;
}
EOL

echo -e "${GREEN}✓ Types de base configurés avec succès${NC}" 