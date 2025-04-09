import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Message, Conversation } from '../types';
import { Box, Typography, Paper, TextField } from '@mui/material';

// Fonction pour traduire le texte
const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    throw new Error('No translation API key found');
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage
      })
    }
  );

  if (!response.ok) {
    throw new Error('Translation request failed');
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
};

interface MessagingProps {
  _conversationId: string;
  _onClose: () => void;
}

const Messaging: React.FC<MessagingProps> = ({ _conversationId, _onClose }) => {
  const { t, i18n } = useTranslation();
  const [messages, _setMessages] = useState<Message[]>([]);
  const [_conversation, _setConversation] = useState<Conversation | null>(null);
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set());
  const [autoTranslate, _setAutoTranslate] = useState(false);
  const [_showTranslations, _setShowTranslations] = useState(false);

  const showNotification = useCallback((_message: string, _type: 'success' | 'error') => {
    // Implémentation de la notification
  }, []);

  const handleTranslateMessage = useCallback(async (messageId: string) => {
    if (!translatingMessages.has(messageId)) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        try {
          await translateText(message.text, i18n.language);
          setTranslatingMessages(prev => new Set(prev).add(messageId));
          showNotification(t('messages.translationSuccess'), 'success');
        } catch (error) {
          showNotification(t('messages.translationError'), 'error');
        }
      }
    }
  }, [messages, translatingMessages, t, i18n, showNotification]);

  useEffect(() => {
    if (autoTranslate && messages.length > 0) {
      messages.forEach(message => {
        if (!translatingMessages.has(message.id)) {
          handleTranslateMessage(message.id);
        }
      });
    }
  }, [autoTranslate, messages, translatingMessages, handleTranslateMessage, showNotification]);

  return (
    <Paper>
      <Box>
        <Typography variant="h6">Messages</Typography>
        <TextField
          placeholder={t('messages.typeMessage')}
          fullWidth
        />
      </Box>
    </Paper>
  );
};

export default Messaging;
