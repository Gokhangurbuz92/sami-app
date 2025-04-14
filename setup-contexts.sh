#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des contextes ===${NC}"

# Configurer le contexte d'authentification
echo -e "${YELLOW}Configuration du contexte d'authentification...${NC}"
cat > src/contexts/AuthContext.tsx << 'EOL'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { auth } from '../services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      // TODO: Implement login logic
    } catch (error) {
      setError(error.message);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // TODO: Implement logout logic
    } catch (error) {
      setError(error.message);
    }
  };

  const register = async (email: string, password: string, displayName: string, role: string) => {
    try {
      setError(null);
      // TODO: Implement registration logic
    } catch (error) {
      setError(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      // TODO: Implement password reset logic
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
EOL

# Configurer le contexte de chat
echo -e "${YELLOW}Configuration du contexte de chat...${NC}"
cat > src/contexts/ChatContext.tsx << 'EOL'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chat, Message } from '../types/chat';
import { db } from '../services/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  setCurrentChat: (chat: Chat) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentChat) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chatId', '==', currentChat.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentChat]);

  const sendMessage = async (content: string, attachments?: File[]) => {
    try {
      setError(null);
      // TODO: Implement send message logic
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setError(null);
      // TODO: Implement delete message logic
    } catch (error) {
      setError(error.message);
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      setError(null);
      // TODO: Implement edit message logic
    } catch (error) {
      setError(error.message);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      setError(null);
      // TODO: Implement add reaction logic
    } catch (error) {
      setError(error.message);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    try {
      setError(null);
      // TODO: Implement remove reaction logic
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        loading,
        error,
        sendMessage,
        deleteMessage,
        editMessage,
        addReaction,
        removeReaction,
        setCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
EOL

# Configurer le contexte de thème
echo -e "${YELLOW}Configuration du contexte de thème...${NC}"
cat > src/contexts/ThemeContext.tsx << 'EOL'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';

type Theme = typeof LIGHT_THEME | typeof DARK_THEME;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
EOL

# Configurer le contexte de langue
echo -e "${YELLOW}Configuration du contexte de langue...${NC}"
cat > src/contexts/LanguageContext.tsx << 'EOL'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // TODO: Load translations for the current language
  }, [language]);

  const t = (key: string) => {
    return translations[key] || key;
  };

  const handleSetLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
EOL

echo -e "${GREEN}✓ Contextes configurés avec succès${NC}" 