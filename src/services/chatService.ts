import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Message {
  content: string;
  senderId: string;
  chatId: string;
  type: 'system' | 'user' | 'assistant';
  timestamp?: Timestamp;
  attachments?: string[];
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export const sendMessage = async (message: Message): Promise<SendMessageResult> => {
  try {
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...message,
      timestamp: Timestamp.now()
    });

    return {
      success: true,
      messageId: messageRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Erreur inconnue lors de l\'envoi du message')
    };
  }
}; 