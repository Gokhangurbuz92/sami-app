import { 
  collection,
  addDoc, 
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  getDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Conversation {
  id?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSenderId: string;
  unreadCount?: {
    [userId: string]: number;
  };
  createdAt: Date;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  reactions?: {
    [userId: string]: string;
  };
  translatedContent?: {
    [lang: string]: string;
  };
  translations?: {
    [lang: string]: {
      content: string;
      timestamp: Date;
    };
  };
  read?: {
    [userId: string]: boolean;
  };
  createdAt: Date;
}

// Obtenir ou créer une conversation entre deux utilisateurs
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<Conversation> => {
  const conversationsRef = collection(db, 'conversations');
  
  // Vérifier si une conversation existe déjà entre ces deux utilisateurs
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const querySnapshot = await getDocs(q);
  
  // Rechercher une conversation avec les deux participants
  const existingConversation = querySnapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(userId2);
  });
  
  if (existingConversation) {
    return {
      id: existingConversation.id,
      ...existingConversation.data(),
      lastMessageTime: existingConversation.data().lastMessageTime?.toDate(),
      createdAt: existingConversation.data().createdAt?.toDate()
    } as Conversation;
  }
  
  // Créer une nouvelle conversation
  const newConversation: Omit<Conversation, 'id'> = {
    participants: [userId1, userId2],
    lastMessage: '',
    lastMessageTime: new Date(),
    lastMessageSenderId: '',
    unreadCount: {
      [userId1]: 0,
      [userId2]: 0
    },
    createdAt: new Date()
  };
  
  const newConversationRef = await addDoc(conversationsRef, {
    ...newConversation,
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  
  return {
    id: newConversationRef.id,
    ...newConversation
  };
};

// Obtenir les conversations d'un utilisateur
export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lastMessageTime: doc.data().lastMessageTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate()
  })) as Conversation[];
};

// Envoyer un message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  attachments: string[] = []
): Promise<Message> => {
  const messagesRef = collection(db, 'messages');
  const conversationRef = doc(db, 'conversations', conversationId);
  
  // Récupérer la conversation pour obtenir les participants
  const conversationDoc = await getDoc(conversationRef);
  if (!conversationDoc.exists()) {
    throw new Error('Conversation not found');
  }
  
  const conversationData = conversationDoc.data();
  const participants = conversationData.participants as string[];
  
  // Créer un objet read avec tous les participants à false, sauf l'expéditeur
  const read: { [key: string]: boolean } = {};
  participants.forEach(participant => {
    read[participant] = participant === senderId; // true pour l'expéditeur, false pour les autres
  });
  
  // Créer le message
  const newMessage: Omit<Message, 'id'> = {
    conversationId,
    senderId,
    content,
    attachments,
    read,
    createdAt: new Date()
  };
  
  // Ajouter le message à Firestore
  const messageRef = await addDoc(messagesRef, {
    ...newMessage,
    createdAt: serverTimestamp()
  });
  
  // Mettre à jour la conversation avec le dernier message
  const unreadUpdate: { [key: string]: number } = {};
  participants.forEach(participant => {
    if (participant !== senderId) {
      unreadUpdate[`unreadCount.${participant}`] = (conversationData.unreadCount?.[participant] || 0) + 1;
    }
  });
  
  await updateDoc(conversationRef, {
    lastMessage: content,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: senderId,
    ...unreadUpdate
  });
  
  return {
    id: messageRef.id,
    ...newMessage
  };
};

// Récupérer les messages d'une conversation
export const getMessagesForConversation = async (
  conversationId: string,
  userId: string
): Promise<Message[]> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  })) as Message[];
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const messagesRef = collection(db, 'messages');
  const conversationRef = doc(db, 'conversations', conversationId);
  
  // Récupérer tous les messages non lus par cet utilisateur
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    where(`read.${userId}`, '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  
  // Mettre à jour chaque message
  const updatePromises = querySnapshot.docs.map(doc => {
    const messageRef = doc.ref;
    return updateDoc(messageRef, {
      [`read.${userId}`]: true
    });
  });
  
  // Mettre à jour le compteur de messages non lus dans la conversation
  const updateConversation = updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0
  });
  
  // Exécuter toutes les promesses
  await Promise.all([...updatePromises, updateConversation]);
};

// Obtenir le nombre total de messages non lus pour un utilisateur
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  let totalUnread = 0;
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    totalUnread += data.unreadCount?.[userId] || 0;
  });
  
  return totalUnread;
};
