import React, { useEffect, useState } from 'react';
import { userService, User } from '../services/userService';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AdminAssignation() {
  const { t } = useTranslation();
  const [jeunes, setJeunes] = useState<User[]>([]);
  const [referents, setReferents] = useState<User[]>([]);
  const [selectedJeune, setSelectedJeune] = useState('');
  const [selectedReferent, setSelectedReferent] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer tous les jeunes
        const jeunesList = await userService.getUsersByRole('jeune');
        setJeunes(jeunesList);

        // Récupérer tous les référents et co-référents
        const referentsList = await userService.getUsersByRole('referent');
        const coreferentsList = await userService.getUsersByRole('coreferent');
        setReferents([...referentsList, ...coreferentsList]);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedJeune || !selectedReferent) return;

    try {
      setError(null);
      await userService.assignReferentToYouth(selectedJeune, selectedReferent);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Réinitialiser les sélections
      setSelectedJeune('');
      setSelectedReferent('');
    } catch (err) {
      console.error("Erreur lors de l'assignation:", err);
      setError("Impossible d'effectuer l'assignation. Veuillez réessayer.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('userManagement.assignReferents')}
      </Typography>

      {loading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel id="jeune-label">{t('roles.jeune')}</InputLabel>
            <Select
              labelId="jeune-label"
              value={selectedJeune}
              label={t('roles.jeune')}
              onChange={(e) => setSelectedJeune(e.target.value)}
            >
              {jeunes.map((j) => (
                <MenuItem key={j.uid} value={j.uid}>
                  {j.displayName || j.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="ref-label">{t('roles.referent')}</InputLabel>
            <Select
              labelId="ref-label"
              value={selectedReferent}
              label={t('roles.referent')}
              onChange={(e) => setSelectedReferent(e.target.value)}
            >
              {referents.map((r) => (
                <MenuItem key={r.uid} value={r.uid}>
                  {r.displayName || r.email} ({t(`roles.${r.role}`)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedJeune || !selectedReferent}
          >
            {t('userManagement.assignReferents')}
          </Button>

          {success && <Alert severity="success">{t('userManagement.assignSuccess')}</Alert>}
        </Stack>
      )}
    </Box>
  );
}
