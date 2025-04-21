import { Timestamp } from 'firebase/firestore';

export interface FirebaseResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
  language?: string;
}

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  assignedReferents?: string[];
  assignedYouths?: string[];
}

export interface FirestoreUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedReferents?: string[];
  assignedYouths?: string[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  message?: string;
  read: boolean;
  timestamp: Date;
  userId: string;
  data?: Record<string, string>;
  createdAt?: Date;
  type?: string;
  link?: string;
}

export interface Appointment {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  userId: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Referent extends User {
  assignedYouths: string[];
  phoneNumber?: string;
  photoURL?: string;
  role: 'referent' | 'coreferent';
}

export interface Youth extends User {
  assignedReferents: string[];
}

export type UserRole = 'jeune' | 'referent' | 'admin' | 'coreferent';

export interface ApiResponse<T> {
  data: T | null;
  error: string | Error | null;
  status: number;
  success: boolean;
}

export interface ErrorResponse {
  data: null;
  error: string | Error;
  status: number;
  success: false;
} 