import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Fab,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Add as AddIcon,
  Translate as TranslateIcon,
  EmojiEmotions as EmojiIcon,
  ThumbUp as ThumbUpIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  limit,
  Timestamp,
  startAfter,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { translateText } from '../services/translation';
import { userService } from '../services/userService';

// Constantes pour la configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_MESSAGES_PER_PAGE = 50;
const TYPING_TIMEOUT = 3000;
const TYPING_CHECK_INTERVAL = 5000;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_ATTACHMENTS = 5;

// Constantes pour les réactions
const MAX_REACTIONS_PER_USER = 5;
const REACTION_DEBOUNCE_TIME = 500; // ms

interface Message {
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

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
}

interface ConversationData {
  typing?: {
    [key: string]: Timestamp;
  };
  lastRead?: {
    [key: string]: {
      timestamp: Timestamp;
      messageCount: number;
    };
  };
}

interface FileUploadError {
  code: string;
  message: string;
}

interface MessagingProps {
  initialConversationId?: string | null;
}

// Fonction pour vérifier si une conversation est autorisée
const isConversationAllowed = async (
  conversation: Conversation,
  currentUser: any
): Promise<boolean> => {
  const participants = conversation.participants;

  // Vérifier si l'utilisateur est un participant
  if (!participants.includes(currentUser.uid)) return false;

  try {
    // Obtenir les données de l'utilisateur actuel depuis Firestore
    const userData = await userService.getUserById(currentUser.uid);
    if (!userData) return false;

    // Si c'est un admin, il peut tout voir
    if (userData.role === 'admin') return true;

    // Si c'est un jeune, il peut parler à ses référents uniquement
    if (userData.role === 'jeune') {
      const allowedUsers = userData.assignedReferents || [];
      return participants.every((p) => p === currentUser.uid || allowedUsers.includes(p));
    }

    // Si c'est un référent ou co-référent, il peut parler à ses jeunes uniquement
    if (userData.role === 'referent' || userData.role === 'coreferent') {
      const allowedUsers = userData.assignedYouths || [];
      return participants.every((p) => p === currentUser.uid || allowedUsers.includes(p));
    }

    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    return false;
  }
};

// Fonction pour vérifier si une conversation peut être créée entre deux utilisateurs
const canCreateConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<boolean> => {
  try {
    const currentUserData = await userService.getUserById(currentUserId);
    const otherUserData = await userService.getUserById(otherUserId);

    if (!currentUserData || !otherUserData) return false;

    // Si l'un est admin, autoriser la conversation
    if (currentUserData.role === 'admin' || otherUserData.role === 'admin') return true;

    // Jeune peut parler à son référent
    if (
      currentUserData.role === 'jeune' &&
      (otherUserData.role === 'referent' || otherUserData.role === 'coreferent')
    ) {
      return currentUserData.assignedReferents?.includes(otherUserId) || false;
    }

    // Référent peut parler à son jeune
    if (
      (currentUserData.role === 'referent' || currentUserData.role === 'coreferent') &&
      otherUserData.role === 'jeune'
    ) {
      return currentUserData.assignedYouths?.includes(otherUserId) || false;
    }

    // Pas de conversation entre jeunes ou entre référents
    return false;
  } catch (error) {
    console.error(
      'Erreur lors de la vérification des autorisations pour créer une conversation:',
      error
    );
    return false;
  }
};

// Fonction pour créer une nouvelle conversation
const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    // Vérifier si les utilisateurs peuvent communiquer
    const isAllowed = await canCreateConversation(currentUserId, otherUserId);
    if (!isAllowed) {
      throw new Error('Vous ne pouvez pas créer de conversation avec cet utilisateur');
    }

    // Vérifier si une conversation existe déjà
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUserId)
    );

    const querySnapshot = await getDocs(conversationsQuery);
    const existingConversation = querySnapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Créer une nouvelle conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: [currentUserId, otherUserId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      typing: {},
      lastRead: {}
    });

    return conversationRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return null;
  }
};

const Messaging: React.FC<MessagingProps> = ({ initialConversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [translateAnchorEl, setTranslateAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [lastRead, setLastRead] = useState<{
    [key: string]: {
      timestamp: Timestamp;
      messageCount: number;
    };
  }>({});
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set());
  const [showTranslations, setShowTranslations] = useState<Set<string>>(new Set());
  const reactionTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastLoadedMessage, setLastLoadedMessage] = useState<string | null>(null);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [showContactsDialog, setShowContactsDialog] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false);

  // Effet pour gérer l'initialConversationId
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversation(initialConversationId);
    }
  }, [initialConversationId]);

  // Fonction pour marquer les messages comme lus
  const markMessagesAsRead = useCallback(
    async (conversationId: string) => {
      if (!currentUser) return;

      try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          [`lastRead.${currentUser.uid}`]: serverTimestamp()
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de lastRead:', error);
      }
    },
    [currentUser]
  );

  // Fonction pour gérer l'indicateur de frappe
  const handleTyping = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;

      setIsTyping((prev) => ({ ...prev, [conversationId]: true }));

      // Effacer le timeout précédent s'il existe
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }

      // Définir un nouveau timeout
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        setIsTyping((prev) => ({ ...prev, [conversationId]: false }));
      }, TYPING_TIMEOUT);

      // Mettre à jour le statut de frappe dans Firestore
      try {
        const conversationRef = doc(db, 'conversations', conversationId);
        updateDoc(conversationRef, {
          [`typing.${currentUser.uid}`]: serverTimestamp()
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de frappe:', error);
      }
    },
    [currentUser]
  );

  // Fonction pour faire défiler jusqu'au dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialiser les notifications push
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Vérifier si les notifications sont supportées
        if (!('Notification' in window)) {
          console.log(t('messaging.notifications.notSupported'));
          return;
        }

        // Demander la permission pour les notifications
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log(t('messaging.notifications.permission.denied'));
          return;
        }

        // Vérifier si Firebase Messaging est supporté
        const messagingInstance = await getMessaging();
        if (!messagingInstance) {
          console.log(t('messaging.notifications.firebaseNotSupported'));
          return;
        }

        // Obtenir le token FCM
        const token = await getToken(messagingInstance, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        if (token && currentUser?.uid) {
          // Sauvegarder le token dans Firestore
          await updateDoc(doc(db, 'users', currentUser.uid), {
            fcmToken: token,
            notificationEnabled: true,
            lastTokenUpdate: serverTimestamp()
          });
        }

        // Écouter les messages en arrière-plan
        onMessage(messagingInstance, (payload) => {
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || '', {
              body: payload.notification?.body,
              icon: '/logo192.png',
              badge: '/logo192.png',
              tag: 'message-notification',
              data: payload.data,
              requireInteraction: true,
              silent: false
            });
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation des notifications:", error);
      }
    };

    if (currentUser) {
      initializeNotifications();
    }

    // Nettoyer les notifications lors du démontage
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister();
        });
      }
    };
  }, [currentUser, t]);

  // Effet pour surveiller les conversations
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Récupérer les conversations de l'utilisateur
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribeConversations = onSnapshot(conversationsQuery, async (snapshot) => {
      const conversationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];

      // Filtrer les conversations autorisées
      const filteredConversations = [];
      for (const conversation of conversationsData) {
        if (await isConversationAllowed(conversation, currentUser)) {
          filteredConversations.push(conversation);
        }
      }

      setConversations(filteredConversations);
      setLoading(false);
    });

    return () => unsubscribeConversations();
  }, [currentUser]);

  // Effet pour surveiller les nouveaux messages
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'messages'),
        where('conversationId', '==', selectedConversation),
        orderBy('createdAt', 'desc'),
        limit(MAX_MESSAGES_PER_PAGE)
      ),
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(newMessages.reverse());
        scrollToBottom();
        markMessagesAsRead(selectedConversation);
      },
      (error) => {
        console.error('Erreur lors de la récupération des messages:', error);
        showNotification(t('messaging.loadError'), 'error');
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, markMessagesAsRead, t]);

  // Effet pour surveiller les statuts de frappe
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = onSnapshot(doc(db, 'conversations', selectedConversation), (doc) => {
      const data = doc.data() as ConversationData | undefined;
      if (data?.typing) {
        const typingUsers = Object.entries(data.typing)
          .filter(([uid, timestamp]) => {
            return (
              uid !== currentUser?.uid &&
              timestamp instanceof Timestamp &&
              Date.now() - timestamp.toMillis() < TYPING_CHECK_INTERVAL
            );
          })
          .map(([uid]) => uid);

        setIsTyping((prev) => ({
          ...prev,
          [selectedConversation]: typingUsers.length > 0
        }));
      }

      if (data?.lastRead) {
        setLastRead(data.lastRead);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation, currentUser]);

  // Fonction sécurisée pour nettoyer le contenu du message
  const sanitizeMessageContent = (content: string): string => {
    return content
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/[<>]/g, '') // Supprimer les caractères dangereux
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH); // Limiter la longueur
  };

  // Fonction sécurisée pour valider les fichiers
  const validateFile = (file: File): boolean => {
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      alert(t('messaging.attachments.errorSize'));
      return false;
    }

    // Vérifier le type de fichier
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert(t('messaging.attachments.errorType'));
      return false;
    }

    // Vérifier le nom du fichier
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (safeFileName.length > 255) {
      alert(t('messaging.attachments.errorNameTooLong'));
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const validFiles = files.filter(validateFile);

    // Limiter le nombre de fichiers
    if (validFiles.length > MAX_ATTACHMENTS) {
      alert(t('messaging.attachments.errorTooManyFiles'));
      return;
    }

    setAttachments(validFiles);
  };

  const handlePreviewFile = (file: File) => {
    // Nettoyer l'URL précédente si elle existe
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }

    const url = URL.createObjectURL(file);
    setPreviewFile({ url, type: file.type, name: file.name });
  };

  // Nettoyer les URLs lors du démontage
  useEffect(() => {
    return () => {
      if (previewFile?.url) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setEmojiAnchorEl(null);
  };

  const handleTranslate = async (messageId: string) => {
    try {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: message.content,
          target: i18n.language,
          key: 'VOTRE_CLE_API_GOOGLE_TRANSLATE'
        })
      });

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      await updateDoc(doc(db, 'messages', messageId), {
        [`translations.${i18n.language}`]: translatedText
      });
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
    }
  };

  // Fonction sécurisée pour gérer les réactions
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    // Effacer le timeout précédent s'il existe
    if (reactionTimeoutRef.current[messageId]) {
      clearTimeout(reactionTimeoutRef.current[messageId]);
    }

    // Définir un nouveau timeout pour éviter les clics multiples
    reactionTimeoutRef.current[messageId] = setTimeout(async () => {
      const reactions = message.reactions || {};
      const userReactions = reactions[currentUser.uid] || [];

      if (userReactions.includes(emoji)) {
        userReactions.splice(userReactions.indexOf(emoji), 1);
      } else if (userReactions.length < MAX_REACTIONS_PER_USER) {
        userReactions.push(emoji);
      } else {
        alert(t('messaging.reactions.maxReactions'));
        return;
      }

      try {
        await updateDoc(doc(db, 'messages', messageId), {
          [`reactions.${currentUser.uid}`]: userReactions,
          lastReactionTime: serverTimestamp()
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des réactions:', error);
        alert(t('messaging.error'));
      }
    }, REACTION_DEBOUNCE_TIME);
  };

  // Mémoriser les fonctions de callback pour éviter les re-rendus inutiles
  const handleSendMessage = useCallback(async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedConversation || !currentUser)
      return;

    setLoading(true);
    try {
      const sanitizedContent = sanitizeMessageContent(newMessage);

      if (attachments.length > MAX_ATTACHMENTS) {
        showNotification(t('messaging.attachments.errorTooManyFiles'), 'error');
        return;
      }

      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          if (!validateFile(file)) {
            throw new Error('Invalid file');
          }

          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const storageRef = ref(storage, `messages/${selectedConversation}/${fileName}`);

          const uploadTask = uploadBytesResumable(storageRef, file);

          if ('on' in uploadTask && typeof uploadTask.on === 'function') {
            const task = uploadTask as unknown as UploadTask;
            task.on(
              'state_changed',
              (snapshot: { bytesTransferred: number; totalBytes: number }) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
              },
              (error: Error) => {
                console.error('Erreur de téléchargement:', error);
                showNotification(t('messaging.attachments.error'), 'error');
              }
            );
          }

          const result = await uploadTask;
          const url = await getDownloadURL(storageRef);
          return {
            url,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            name: file.name,
            size: file.size,
            mimeType: file.type
          };
        })
      );

      const messageData = {
        content: sanitizedContent,
        conversationId: selectedConversation,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonyme',
        senderRole: (currentUser as any).role || 'youth',
        createdAt: serverTimestamp(),
        attachments: uploadedAttachments,
        reactions: {},
        translations: {}
      };

      await addDoc(collection(db, 'messages'), messageData);

      const conversationRef = doc(db, 'conversations', selectedConversation);
      await updateDoc(conversationRef, {
        lastMessage: sanitizedContent || t('messaging.attachments.fileAttached'),
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      });

      setNewMessage('');
      setAttachments([]);
      setUploadProgress({});
      showNotification(t('messaging.messageSent'), 'success');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      showNotification(t('messaging.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [newMessage, attachments, selectedConversation, currentUser, t]);

  // Mémoriser le rendu du contenu du message
  const renderMessageContent = useCallback(
    (message: Message) => {
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
              {showTranslations.has(message.id) && message.translations?.[i18n.language]
                ? message.translations[i18n.language]
                : message.content}
            </Typography>
            {shouldShowTranslateButton(message) && (
              <Tooltip title={t('messaging.translation.show')}>
                <IconButton
                  size="small"
                  onClick={() => translateMessage(message)}
                  disabled={translatingMessages.has(message.id)}
                >
                  <TranslateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {message.attachments?.map((attachment, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                />
              ) : (
                <Button
                  startIcon={<FileIcon />}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.name}
                </Button>
              )}
            </Box>
          ))}
          {message.reactions && Object.entries(message.reactions).length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
              {Object.entries(message.reactions).map(([userId, emojis]) => (
                <Chip
                  key={userId}
                  label={emojis.join(' ')}
                  size="small"
                  onClick={(e) => handleReaction(message.id, emojis[0])}
                />
              ))}
            </Stack>
          )}
        </Box>
      );
    },
    [showTranslations, i18n.language, handleReaction, t, translatingMessages, shouldShowTranslateButton, translateMessage]
  );

  // Mémoriser le composant de message pour éviter les re-rendus inutiles
  const MessageItem = useCallback(
    ({ message }: { message: Message }) => {
      const isOwnMessage = message.senderId === currentUser?.uid;
      const isTranslatable = !isOwnMessage && message.content && message.content.trim().length > 0;

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            mb: 2
          }}
        >
          <Paper
            sx={{
              p: 2,
              maxWidth: '70%',
              backgroundColor: isOwnMessage ? 'primary.light' : 'grey.100',
              color: isOwnMessage ? 'white' : 'text.primary'
            }}
          >
            {renderMessageContent(message)}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.senderName}
                {isTranslatable && <span title={t('messaging.translatable')}> 🌐</span>}
              </Typography>
              <Box>
                {isTranslatable && (
                  <Button 
                    size="small" 
                    startIcon={<TranslateIcon fontSize="small" />}
                    onClick={() => translateMessage(message)}
                    disabled={translatingMessages.has(message.id)}
                    sx={{ mr: 1, fontSize: '0.75rem' }}
                  >
                    {t('messaging.translate.button')}
                  </Button>
                )}
                <IconButton size="small" onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                  <EmojiIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    },
    [currentUser, renderMessageContent, t, translatingMessages, translateMessage]
  );

  // Fonction pour traduire un message
  const translateMessage = async (message: Message) => {
    if (!message.content || translatingMessages.has(message.id)) return;

    const targetLang = i18n.language;
    if (message.translations?.[targetLang]) {
      toggleTranslation(message.id);
      return;
    }

    try {
      setTranslatingMessages((prev) => new Set([...prev, message.id]));
      showNotification(t('messaging.translation.inProgress'), 'success');

      // Utiliser une clé API sécurisée depuis les variables d'environnement
      const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        throw new Error('Translation API key not configured');
      }

      const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: message.content,
          target: targetLang,
          key: apiKey
        })
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Mettre à jour le message dans Firestore avec la traduction
      const messageRef = doc(db, 'messages', message.id);
      await updateDoc(messageRef, {
        [`translations.${targetLang}`]: translatedText
      });

      // Afficher la traduction
      toggleTranslation(message.id);
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      alert(t('messaging.translationError'));
    } finally {
      setTranslatingMessages((prev) => {
        const next = new Set(prev);
        next.delete(message.id);
        return next;
      });
    }
  };

  // Fonction pour basculer l'affichage de la traduction
  const toggleTranslation = (messageId: string) => {
    setShowTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  // Fonction pour activer/désactiver la traduction automatique
  const toggleAutoTranslate = () => {
    setAutoTranslate(prev => !prev);
    showNotification(
      autoTranslate 
        ? t('messaging.translation.autoDisabled')
        : t('messaging.translation.autoEnabled'),
      'success'
    );
  };

  // Effet pour traduire automatiquement les nouveaux messages
  useEffect(() => {
    if (autoTranslate && messages.length > 0) {
      messages.forEach(message => {
        if (shouldShowTranslateButton(message)) {
          translateMessage(message);
        }
      });
    }
  }, [autoTranslate, messages, shouldShowTranslateButton, translateMessage]);

  // Fonction pour détecter si un message doit être traduit
  const shouldShowTranslateButton = (message: Message) => {
    return (
      message.senderId !== currentUser?.uid && // Ne pas traduire ses propres messages
      !translatingMessages.has(message.id) && // Ne pas montrer pendant la traduction
      (!message.translations?.[i18n.language] || // Pas encore traduit dans la langue actuelle
        !showTranslations.has(message.id))
    ); // Ou la traduction n'est pas affichée
  };

  // Nettoyer les timeouts lors du démontage
  useEffect(() => {
    return () => {
      Object.values(reactionTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleFileError = (error: FileUploadError): void => {
    console.error('File upload error:', error);
    alert(t('messaging.attachments.error'));
  };

  const handleTranslationError = (error: Error): void => {
    console.error('Translation error:', error);
    alert(t('messaging.translation.error'));
  };

  // Fonction pour afficher les messages d'erreur/succès
  const showNotification = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Fonction pour charger plus de messages
  const loadMoreMessages = async () => {
    if (!selectedConversation || isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', selectedConversation),
        orderBy('createdAt', 'desc'),
        startAfter(lastLoadedMessage || new Date()),
        limit(MAX_MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(messagesQuery);
      if (snapshot.empty) {
        setHasMoreMessages(false);
        return;
      }

      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      setLastLoadedMessage(newMessages[newMessages.length - 1].createdAt as any);
      setMessages((prev) => [...prev, ...newMessages.reverse()]);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      showNotification(t('messaging.loadError'), 'error');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Gestionnaire de défilement pour charger plus de messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // Effet pour charger les contacts disponibles
  useEffect(() => {
    const loadAvailableContacts = async () => {
      if (!currentUser) return;

      try {
        const userData = await userService.getUserById(currentUser.uid);
        if (!userData) return;

        const contacts = [];

        // Si l'utilisateur est un jeune, charger ses référents
        if (userData.role === 'jeune' && userData.assignedReferents?.length) {
          const referents = await Promise.all(
            userData.assignedReferents.map((id) => userService.getUserById(id))
          );
          contacts.push(...referents.filter(Boolean));
        }

        // Si l'utilisateur est un référent, charger ses jeunes
        if (
          (userData.role === 'referent' || userData.role === 'coreferent') &&
          userData.assignedYouths?.length
        ) {
          const youths = await Promise.all(
            userData.assignedYouths.map((id) => userService.getUserById(id))
          );
          contacts.push(...youths.filter(Boolean));
        }

        setAvailableContacts(contacts);
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
      }
    };

    loadAvailableContacts();
  }, [currentUser]);

  // Fonction pour démarrer une nouvelle conversation
  const startNewConversation = async (otherUserId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const conversationId = await createConversation(currentUser.uid, otherUserId);

      if (conversationId) {
        setSelectedConversation(conversationId);
        setShowContactsDialog(false);
      } else {
        showNotification(t('messaging.error'), 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      showNotification(t('messaging.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter le bouton pour créer une nouvelle conversation
  const renderNewConversationButton = () => {
    return (
      <Fab
        color="primary"
        size="small"
        onClick={() => setShowContactsDialog(true)}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    );
  };

  // Ajouter la boîte de dialogue pour sélectionner un contact
  const renderContactsDialog = () => {
    return (
      <Dialog
        open={showContactsDialog}
        onClose={() => setShowContactsDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('messaging.newConversation')}</DialogTitle>
        <DialogContent>
          {availableContacts.length === 0 ? (
            <Typography>{t('messaging.noContacts')}</Typography>
          ) : (
            <List>
              {availableContacts.map((contact) => (
                <ListItem
                  button
                  key={contact.uid}
                  onClick={() => startNewConversation(contact.uid)}
                >
                  <ListItemAvatar>
                    <Avatar>{contact.displayName?.[0] || '?'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.displayName || contact.email}
                    secondary={t(`roles.${contact.role}`)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
        {/* Messages d'erreur/succès */}
        {error && (
          <Snackbar
            open={Boolean(error)}
            autoHideDuration={5000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar
            open={Boolean(success)}
            autoHideDuration={3000}
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Snackbar>
        )}

        {/* Liste des conversations */}
        <Paper sx={{ width: 320, borderRadius: 0, overflowY: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography variant="h6">{t('messaging.conversations')}</Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {conversations.map((conv) => (
              <ListItem
                button
                key={conv.id}
                selected={selectedConversation === conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {conv.participants.find((p) => p !== currentUser?.uid)?.[0] || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.participants.find((p) => p !== currentUser?.uid)}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: 'inline',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200
                      }}
                    >
                      {conv.lastMessage}
                    </Typography>
                  }
                />
                {conv.unreadCount > 0 && <Badge badgeContent={conv.unreadCount} color="primary" />}
              </ListItem>
            ))}
          </List>
          {renderNewConversationButton()}
        </Paper>

        {/* Zone de messages */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <Box sx={{ 
                p: 1, 
                display: 'flex', 
                justifyContent: 'flex-end', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)' 
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoTranslate}
                      onChange={toggleAutoTranslate}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption">
                      {t('messaging.translation.auto')}
                    </Typography>
                  }
                  sx={{ mr: 1 }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column-reverse'
                }}
                onScroll={handleScroll}
              >
                {isLoadingMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                {attachments.length > 0 && (
                  <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() =>
                          setAttachments((prev) => prev.filter((_, i) => i !== index))
                        }
                        onClick={() => handlePreviewFile(file)}
                        icon={file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />}
                      />
                    ))}
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <Box key={fileName} sx={{ width: '100%', mt: 1 }}>
                        <Typography variant="caption">{fileName}</Typography>
                        <CircularProgress variant="determinate" value={progress} size={20} />
                      </Box>
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    multiple
                  />
                  <IconButton color="primary" onClick={() => fileInputRef.current?.click()}>
                    <AttachFileIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t('messaging.typeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading}
                  />
                  <IconButton color="primary" onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                    <EmojiIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={loading || (!newMessage.trim() && attachments.length === 0)}
                  >
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <Typography>{t('messaging.selectConversation')}</Typography>
            </Box>
          )}
          {selectedConversation && isTyping[selectedConversation] && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', ml: 2 }}>
              {t('messaging.typing')}
            </Typography>
          )}
        </Paper>

        <Menu
          anchorEl={emojiAnchorEl}
          open={Boolean(emojiAnchorEl)}
          onClose={() => setEmojiAnchorEl(null)}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
        </Menu>

        <Menu
          anchorEl={translateAnchorEl}
          open={Boolean(translateAnchorEl)}
          onClose={() => setTranslateAnchorEl(null)}
        >
          <MenuItem onClick={() => handleTranslate(selectedConversation || '')}>
            {t('messaging.translate')}
          </MenuItem>
        </Menu>
      </Box>

      {/* Dialogs */}
      {renderContactsDialog()}

      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewFile?.name}</DialogTitle>
        <DialogContent>
          {previewFile?.type.startsWith('image/') ? (
            <img
              src={previewFile.url}
              alt={previewFile.name}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          ) : (
            <iframe
              src={previewFile?.url}
              style={{ width: '100%', height: '70vh' }}
              title={previewFile?.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Messaging;
