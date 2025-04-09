export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'referent' | 'jeune';
  assignedReferents?: string[];
  assignedYouths?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Referent extends User {
  role: 'referent';
  specialization?: string;
  availability?: string[];
  assignedYouths: string[];
}

export interface Youth extends User {
  role: 'jeune';
  assignedReferents: string[];
  dateOfBirth?: string;
  nationality?: string;
  educationLevel?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  translatedText?: string;
  isTranslated?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  status: number;
} 