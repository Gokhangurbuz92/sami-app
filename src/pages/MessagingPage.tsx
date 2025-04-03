import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Messaging from '../components/Messaging';

const MessagingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('messaging.title')}
        </Typography>
      </Box>
      <Box sx={{ height: 'calc(100% - 48px)' }}>
        <Messaging />
      </Box>
    </Container>
  );
};

export default MessagingPage; 