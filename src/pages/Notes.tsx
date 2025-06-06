import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NotesList from '../components/NotesList';
import NoteForm from '../components/NoteForm';
import { Note } from '../services/noteService';

const Notes: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>(undefined);

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  const handleSaveNote = () => {
    setIsFormOpen(false);
    setSelectedNote(undefined);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('notes.title')}
        </Typography>
        <NotesList onEditNote={handleEditNote} />
      </Paper>
      <NoteForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveNote}
        note={selectedNote}
      />
    </Box>
  );
};

export default Notes;
