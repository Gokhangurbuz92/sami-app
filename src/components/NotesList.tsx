import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Typography,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { noteService, Note } from '../services/noteService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSnackbar } from 'notistack';

interface NotesListProps {
  _onEditNote?: (note: Note) => void;
  userId: string;
}

const NotesList: React.FC<NotesListProps> = ({ _onEditNote, userId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [shouldLoadNotes, setShouldLoadNotes] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!user) return;
    try {
      const fetchNotes = async () => {
        const fetchedNotes = await noteService.getNotes(user.uid, userId);
        setNotes(fetchedNotes);
      };
      fetchNotes();
    } catch (error) {
      console.error('Error loading notes:', error);
      enqueueSnackbar(t('errors.loadNotes'), { variant: 'error' });
    }
  }, [user, userId, shouldLoadNotes]);

  const handleAddNote = () => {
    setSelectedNote(null);
    setEditedTitle('');
    setEditedContent('');
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm(t('notes.confirmDelete'))) {
      try {
        await noteService.deleteNote(noteId);
        setNotes(notes.filter((note) => note.id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'error';
      case 'social':
        return 'primary';
      case 'education':
        return 'success';
      case 'general':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp: Date | { toDate: () => Date }): string => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveNote = async () => {
    try {
      const noteData = {
        title: editedTitle,
        content: editedContent,
        userId
      };

      const url = isEditing && selectedNote
        ? `/api/notes/${selectedNote.id}`
        : '/api/notes';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      const savedNote = await response.json();

      setNotes(prevNotes => {
        if (isEditing && selectedNote) {
          return prevNotes.map(note =>
            note.id === selectedNote.id ? savedNote : note
          );
        }
        return [...prevNotes, savedNote];
      });

      setIsDialogOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving note:', error.message);
        enqueueSnackbar(t('errors.saveNote'), { variant: 'error' });
      }
    }
  };

  const _handleNoteAction = async (_action: 'create' | 'update' | 'delete', _noteData?: Note): Promise<void> => {
    try {
      // ... existing code ...
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        enqueueSnackbar(t('errors.unexpected'), { variant: 'error' });
      }
    }
  };

  const _handleError = (error: Error): void => {
    console.error('Error:', error);
    enqueueSnackbar(t('errors.unexpected'), { variant: 'error' });
  };

  const _handleApiError = (error: Error): void => {
    console.error('API Error:', error);
    enqueueSnackbar(t('errors.api'), { variant: 'error' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('notes.title')}</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={handleAddNote}
        >
          {t('notes.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('notes.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <List>
          {filteredNotes.map((note) => (
            <ListItem
              key={note.id}
              divider
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{note.title}</Typography>
                    <Chip
                      label={t(`notes.priority.${note.priority}`)}
                      size="small"
                      color={getPriorityColor(note.priority)}
                    />
                    <Chip
                      label={t(`notes.category.${note.category}`)}
                      size="small"
                      color={getCategoryColor(note.category)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {note.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {formatDate(note.createdAt)}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {note.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditNote(note)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id || '')}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {isEditing ? t('notes.edit') : t('notes.add')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('notes.titleLabel')}
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label={t('notes.contentLabel')}
            fullWidth
            multiline
            rows={4}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveNote} color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesList;
