import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/user';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  reactions: {
    [key: string]: string[]; // emoji -> userId[]
  };
  mentions: string[]; // userId[]
  isGroup: boolean;
  groupId?: string;
}

export class MessagingService {
  private static instance: MessagingService;
  private messagesCollection = collection(db, 'messages');

  private constructor() {}

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async sendMessage(content: string, sender: User, recipientId: string, isGroup: boolean = false): Promise<string> {
    const mentions = this.extractMentions(content);
    
    const messageData = {
      content,
      senderId: sender.id,
      senderName: sender.name,
      timestamp: Timestamp.now(),
      reactions: {},
      mentions,
      isGroup
    };

    const collectionPath = isGroup ? 'groupMessages' : 'privateMessages';
    const docRef = await addDoc(collection(db, collectionPath), messageData);
    return docRef.id;
  }

  async addReaction(messageId: string, emoji: string, userId: string, isGroup: boolean = false): Promise<void> {
    const collectionPath = isGroup ? 'groupMessages' : 'privateMessages';
    const messageRef = doc(db, collectionPath, messageId);
    const messageDoc = await getDoc(messageRef);
    const messageData = messageDoc.data() as Message;
    
    const reactions = messageData.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
      await updateDoc(messageRef, { reactions });
    }
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  subscribeToMessages(
    userId: string,
    callback: (messages: Message[]) => void,
    isGroup: boolean = false
  ): () => void {
    const collectionPath = isGroup ? 'groupMessages' : 'privateMessages';
    const q = query(
      collection(db, collectionPath),
      where(isGroup ? 'groupId' : 'recipientId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Message[];
      callback(messages);
    });
  }
} 