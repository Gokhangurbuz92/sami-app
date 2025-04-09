import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';

interface FirestoreMessage {
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: { toDate: () => Date };
  translatedText?: string;
  isTranslated?: boolean;
}

const convertFirestoreData = (doc: DocumentData): Message => {
  const data = doc.data() as FirestoreMessage;
  return {
    id: doc.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    text: data.text,
    timestamp: data.timestamp.toDate(),
    translatedText: data.translatedText,
    isTranslated: data.isTranslated
  };
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreData);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}; 