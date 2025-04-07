import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  conversationId: string;
  createdAt: Timestamp;
  attachments?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
  translations?: {
    [key: string]: string;
  };
  reactions?: {
    [key: string]: string[];
  };
  translatedContent?: {
    [key: string]: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
}

export interface ConversationData {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    role: string;
  };
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
} 