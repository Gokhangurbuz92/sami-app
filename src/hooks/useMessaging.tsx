import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrCreateConversation,
  sendMessage,
  getMessagesForConversation,
  markMessagesAsRead,
  getConversationsForUser,
  getTotalUnreadCount,
  Conversation,
  Message
} from '../services/messagingService';

export function useMessaging() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Charger les conversations de l'utilisateur
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const userConversations = await getConversationsForUser(currentUser.uid);
      setConversations(userConversations);

      // Mettre à jour le compteur de messages non lus
      const count = await getTotalUnreadCount(currentUser.uid);
      setUnreadCount(count);
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
      console.error('Erreur lors du chargement des conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Charger une conversation spécifique et ses messages
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Trouver la conversation dans la liste
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
          setCurrentConversation(conversation);
        }

        // Charger les messages
        const conversationMessages = await getMessagesForConversation(
          conversationId,
          currentUser.uid
        );
        setMessages(conversationMessages);

        // Marquer les messages comme lus
        await markMessagesAsRead(conversationId, currentUser.uid);

        // Recharger les conversations pour mettre à jour les compteurs
        loadConversations();
      } catch (err) {
        setError('Erreur lors du chargement de la conversation');
        console.error('Erreur lors du chargement de la conversation:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, conversations, loadConversations]
  );

  // Créer ou récupérer une conversation avec un autre utilisateur
  const startConversation = useCallback(
    async (otherUserId: string) => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        const conversation = await getOrCreateConversation(currentUser.uid, otherUserId);
        setCurrentConversation(conversation);

        // Charger les messages de cette conversation
        const conversationMessages = await getMessagesForConversation(
          conversation.id as string,
          currentUser.uid
        );
        setMessages(conversationMessages);

        // Recharger les conversations
        loadConversations();

        return conversation;
      } catch (err) {
        setError('Erreur lors de la création de la conversation');
        console.error('Erreur lors de la création de la conversation:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadConversations]
  );

  // Envoyer un message
  const sendNewMessage = useCallback(
    async (content: string, attachments: string[] = []) => {
      if (!currentUser || !currentConversation?.id) return;

      try {
        setLoading(true);
        setError(null);
        const sentMessage = await sendMessage(
          currentConversation.id,
          currentUser.uid,
          content,
          attachments
        );

        // Ajouter le message à la liste des messages
        setMessages((prevMessages) => [...prevMessages, sentMessage]);

        // Recharger les conversations pour mettre à jour la dernière activité
        loadConversations();

        return sentMessage;
      } catch (err) {
        setError("Erreur lors de l'envoi du message");
        console.error("Erreur lors de l'envoi du message:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, currentConversation, loadConversations]
  );

  // Charger les conversations au montage du composant
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, loadConversations]);

  return {
    loading,
    error,
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loadConversations,
    loadConversation,
    startConversation,
    sendMessage: sendNewMessage
  };
}
