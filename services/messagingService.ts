import { 
  collection,
  addDoc,
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp as _Timestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { isJeuneAssignedToReferent } from './assignation';

// Types pour la messagerie
export interface Message {
  id?: string;
  senderId: string;
  senderName?: string;
  conversationId: string;
  content: string;
  timestamp: _Timestamp;
  isRead: boolean;
  attachments?: string[];
}

export interface Conversation {
  id?: string;
  participants: string[];
  participantNames?: Record<string, string>;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageTimestamp?: _Timestamp;
  lastMessageSenderId?: string;
  unreadCount?: Record<string, number>;
  createdAt: _Timestamp;
  updatedAt: _Timestamp;
}

/**
 * Crée ou récupère une conversation entre deux utilisateurs
 */
export async function getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
  try {
    // Vérifier si les utilisateurs peuvent communiquer
    const canCommunicate = await isJeuneAssignedToReferent(user1Id, user2Id) || 
                           await isJeuneAssignedToReferent(user2Id, user1Id);
    
    if (!canCommunicate) {
      throw new Error("Ces utilisateurs ne peuvent pas communiquer ensemble");
    }
    
    // Récupérer les noms des utilisateurs
    const user1Doc = await getDoc(doc(db, "users", user1Id));
    const user2Doc = await getDoc(doc(db, "users", user2Id));
    
    if (!user1Doc.exists() || !user2Doc.exists()) {
      throw new Error("Un des utilisateurs n'existe pas");
    }
    
    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();
    
    const participantNames = {
      [user1Id]: user1Data.displayName,
      [user2Id]: user2Data.displayName
    };
    
    // Chercher si une conversation existe déjà
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user1Id)
    );
    
    const querySnapshot = await getDocs(q);
    let existingConv: Conversation | null = null;
    
    querySnapshot.forEach(doc => {
      const convData = doc.data() as Conversation;
      if (convData.participants.includes(user2Id)) {
        existingConv = { ...convData, id: doc.id };
      }
    });
    
    // Si une conversation existe, la retourner
    if (existingConv) {
      return existingConv;
    }
    
    // Sinon, créer une nouvelle conversation
    const newConversation: Omit<Conversation, 'id'> = {
      participants: [user1Id, user2Id],
      participantNames,
      unreadCount: { [user1Id]: 0, [user2Id]: 0 },
      createdAt: serverTimestamp() as _Timestamp,
      updatedAt: serverTimestamp() as _Timestamp
    };
    
    const conversationRef = await addDoc(collection(db, "conversations"), newConversation);
    return { ...newConversation, id: conversationRef.id };
  } catch (error) {
    console.error("Erreur lors de la création/récupération de la conversation :", error);
    throw error;
  }
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string, attachments: string[] = []): Promise<Message> {
  try {
    // Vérifier que la conversation existe
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error("Cette conversation n'existe pas");
    }
    
    const conversationData = conversationDoc.data() as Conversation;
    
    // Vérifier que l'expéditeur fait partie de la conversation
    if (!conversationData.participants.includes(senderId)) {
      throw new Error("L'expéditeur ne fait pas partie de cette conversation");
    }
    
    // Récupérer le nom de l'expéditeur
    const senderDoc = await getDoc(doc(db, "users", senderId));
    const senderName = senderDoc.exists() ? senderDoc.data().displayName : "Utilisateur inconnu";
    
    // Créer le message
    const newMessage: Omit<Message, 'id'> = {
      senderId,
      senderName,
      conversationId,
      content,
      timestamp: serverTimestamp() as _Timestamp,
      isRead: false,
      attachments
    };
    
    const messageRef = await addDoc(collection(db, "messages"), newMessage);
    
    // Mettre à jour les informations de la conversation
    const otherParticipants = conversationData.participants.filter(p => p !== senderId);
    const unreadCount = conversationData.unreadCount || {};
    
    // Incrémenter le nombre de messages non lus pour les autres participants
    otherParticipants.forEach(participant => {
      unreadCount[participant] = (unreadCount[participant] || 0) + 1;
    });
    
    await updateDoc(conversationRef, {
      lastMessageId: messageRef.id,
      lastMessageContent: content,
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: senderId,
      unreadCount,
      updatedAt: serverTimestamp()
    });
    
    return { ...newMessage, id: messageRef.id };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    throw error;
  }
}

/**
 * Récupère les messages d'une conversation
 */
export async function getMessagesForConversation(conversationId: string, userId: string, limitCount = 50): Promise<Message[]> {
  try {
    // Vérifier que la conversation existe et que l'utilisateur y participe
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error("Cette conversation n'existe pas");
    }
    
    const conversationData = conversationDoc.data() as Conversation;
    
    if (!conversationData.participants.includes(userId)) {
      throw new Error("L'utilisateur ne participe pas à cette conversation");
    }
    
    // Récupérer les messages
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    
    querySnapshot.forEach(doc => {
      messages.push({ ...doc.data() as Message, id: doc.id });
    });
    
    // Marquer les messages comme lus
    await markMessagesAsRead(conversationId, userId);
    
    return messages.reverse(); // Pour avoir les messages dans l'ordre chronologique
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    throw error;
  }
}

/**
 * Marque les messages d'une conversation comme lus pour un utilisateur
 */
export async function markMessagesAsRead(conversationId: string, _userId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      where("isRead", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus :", error);
    throw error;
  }
}

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach(doc => {
      conversations.push({ ...doc.data() as Conversation, id: doc.id });
    });
    
    return conversations;
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    throw error;
  }
}

/**
 * Obtient le nombre total de messages non lus pour un utilisateur
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const conversations = await getConversationsForUser(userId);
    
    let totalUnread = 0;
    conversations.forEach(conv => {
      const unreadCount = conv.unreadCount ? (conv.unreadCount[userId] || 0) : 0;
      totalUnread += unreadCount;
    });
    
    return totalUnread;
  } catch (error) {
    console.error("Erreur lors du calcul des messages non lus :", error);
    throw error;
  }
} 