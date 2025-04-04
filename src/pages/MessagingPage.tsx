import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Messaging from '../components/Messaging';

const MessagingPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le paramètre conversation de l'URL
    const searchParams = new URLSearchParams(location.search);
    const convId = searchParams.get('conversation');
    if (convId) {
      setConversationId(convId);
    }
  }, [location.search]);

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('messaging.title')}
        </Typography>
      </Box>
      <Box sx={{ height: 'calc(100% - 48px)' }}>
        <Messaging initialConversationId={conversationId} />
      </Box>
    </Container>
  );
};

export default MessagingPage;
