import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { youthService, Youth } from '../services/youthService';
import { useAuth } from '../contexts/AuthContext';

const YouthSearch: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Youth[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [youthToDelete, setYouthToDelete] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Effet pour effectuer la recherche
  useEffect(() => {
    const searchYouth = async () => {
      if (debouncedSearchTerm.length < 2 || !currentUser) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const userUid = currentUser.uid;
        const foundYouth = await youthService.searchYouth(debouncedSearchTerm, userUid);
        setResults(foundYouth);
      } catch (error) {
        console.error('Error searching youth:', error);
      } finally {
        setLoading(false);
      }
    };

    searchYouth();
  }, [debouncedSearchTerm, currentUser]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (youthId: string) => {
    setYouthToDelete(youthId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (youthToDelete) {
      try {
        await youthService.deleteYouth(youthToDelete);
        setResults(prevResults => prevResults.filter(youth => youth.id !== youthToDelete));
      } catch (error) {
        console.error('Error deleting youth:', error);
      }
    }
    setDeleteDialogOpen(false);
    setYouthToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setYouthToDelete(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <TextField
        fullWidth
        label="youth-search"
        inputProps={{
          placeholder: t('youth.searchPlaceholder'),
          id: 'youth_search_input'
        }}
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && results.length === 0 && searchTerm.length >= 2 && (
        <Typography sx={{ textAlign: 'center', my: 2 }}>
          {t('youth.noResults')}
        </Typography>
      )}

      {!loading && results.length > 0 && (
        <List sx={{ width: '100%' }}>
          {results.map((youth) => (
            <ListItem key={youth.id} divider>
              <ListItemText
                primary={`${youth.firstName} ${youth.lastName}`}
                secondary={`${t('youth.dob')}: ${youth.dateOfBirth}`}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  id="delete_button"
                  onClick={() => handleDeleteClick(youth.id || '')}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>{t('youth.delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('youth.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            aria-label="confirm delete"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YouthSearch; 