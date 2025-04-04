import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NotesList from '../components/NotesList';
import NoteForm from '../components/NoteForm';

const Notes: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('notes.title')}
        </Typography>
        <NotesList />
      </Paper>
      <NoteForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </Box>
  );
};

export default Notes;
