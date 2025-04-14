#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des hooks personnalisés ===${NC}"

# Configurer le hook useAuth
echo -e "${YELLOW}Configuration du hook useAuth...${NC}"
cat > src/hooks/useAuth.ts << 'EOL'
import { useState, useEffect } from 'react';
import { auth } from '../services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // TODO: Fetch user data from Firestore
        setUser(user as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};
EOL

# Configurer le hook useChat
echo -e "${YELLOW}Configuration du hook useChat...${NC}"
cat > src/hooks/useChat.ts << 'EOL'
import { useState, useEffect } from 'react';
import { db } from '../services/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Chat, Message } from '../types/chat';

export const useChat = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chatId', '==', chatId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading, error };
};
EOL

# Configurer le hook useNotifications
echo -e "${YELLOW}Configuration du hook useNotifications...${NC}"
cat > src/hooks/useNotifications.ts << 'EOL'
import { useState, useEffect } from 'react';
import { messaging } from '../services/firebase/config';
import { onMessage } from 'firebase/messaging';
import { Notification } from '../types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const notification = {
        id: payload.messageId,
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        data: payload.data,
        createdAt: new Date(),
        isRead: false,
      } as Notification;

      setNotifications((prev) => [notification, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  return { notifications, loading, error };
};
EOL

# Configurer le hook useTranslation
echo -e "${YELLOW}Configuration du hook useTranslation...${NC}"
cat > src/hooks/useTranslation.ts << 'EOL'
import { useState, useEffect } from 'react';
import { translateText } from '../services/translation/config';

export const useTranslation = () => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = async (text: string, targetLanguage: string) => {
    try {
      setLoading(true);
      setError(null);
      const translatedText = await translateText(text, targetLanguage);
      setTranslations((prev) => ({
        ...prev,
        [text]: translatedText,
      }));
      return translatedText;
    } catch (error) {
      setError(error.message);
      return text;
    } finally {
      setLoading(false);
    }
  };

  return { translations, loading, error, translate };
};
EOL

# Configurer le hook useTheme
echo -e "${YELLOW}Configuration du hook useTheme...${NC}"
cat > src/hooks/useTheme.ts << 'EOL'
import { useState, useEffect } from 'react';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';

type Theme = typeof LIGHT_THEME | typeof DARK_THEME;

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(LIGHT_THEME);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(DARK_THEME);
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? LIGHT_THEME : DARK_THEME;
    setTheme(newTheme);
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  return { theme, isDark, toggleTheme };
};
EOL

echo -e "${GREEN}✓ Hooks personnalisés configurés avec succès${NC}" 