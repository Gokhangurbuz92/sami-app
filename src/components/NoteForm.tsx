import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { noteService, Note } from '../services/noteService';

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  note?: Note;
  onSave: () => void;
}

export default function NoteForm({ open, onClose, note, onSave }: NoteFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Note>>({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (note) {
      setFormData(note);
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        tags: []
      });
    }
  }, [note]);

  const handleSubmit = async () => {
    if (!user || !formData.title || !formData.content) return;

    try {
      if (note && note.id) {
        await noteService.updateNote(note.id, formData);
      } else {
        if (!user?.uid) {
          console.error('User ID is required');
          return;
        }
        const newNote: Omit<Note, 'id'> = {
          title: formData.title,
          content: formData.content,
          category: formData.category || 'general',
          priority: formData.priority || 'medium',
          createdBy: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: formData.tags || [],
          youthId: formData.youthId
        };
        await noteService.createNote(newNote);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove)
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{note ? t('notes.editNote') : t('notes.addNote')}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label={t('notes.title')}
          fullWidth
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <TextField
          margin="dense"
          label={t('notes.content')}
          fullWidth
          multiline
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>{t('notes.category')}</InputLabel>
          <Select
            value={formData.category || 'general'}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as Note['category'] })
            }
          >
            <MenuItem value="general">{t('notes.categories.general')}</MenuItem>
            <MenuItem value="medical">{t('notes.categories.medical')}</MenuItem>
            <MenuItem value="social">{t('notes.categories.social')}</MenuItem>
            <MenuItem value="education">{t('notes.categories.education')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>{t('notes.priority')}</InputLabel>
          <Select
            value={formData.priority || 'medium'}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as Note['priority'] })
            }
          >
            <MenuItem value="low">{t('notes.priorities.low')}</MenuItem>
            <MenuItem value="medium">{t('notes.priorities.medium')}</MenuItem>
            <MenuItem value="high">{t('notes.priorities.high')}</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">{t('notes.tags')}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {formData.tags?.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t('notes.addTag')}
            />
            <Button onClick={handleAddTag}>{t('common.add')}</Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
