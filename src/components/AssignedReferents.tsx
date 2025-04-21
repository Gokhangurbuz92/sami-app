import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { fetchReferents } from '../services/referents';
import { Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Referent } from '../types/firebase';

export default function AssignedReferents() {
  const { currentUser, isJeune } = useAuth();
  const { t } = useTranslation();
  const [referents, setReferents] = useState<Referent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReferents = async () => {
      if (!currentUser || !isJeune) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les données du jeune pour obtenir ses référents assignés
        const jeuneDoc = await userService.getUserById(currentUser.uid);

        if (!jeuneDoc || !jeuneDoc.assignedReferents || jeuneDoc.assignedReferents.length === 0) {
          setReferents([]);
          setLoading(false);
          return;
        }

        // Utiliser fetchReferents pour obtenir les détails des référents
        const referentsList = await fetchReferents(jeuneDoc.assignedReferents);
        setReferents(referentsList as Referent[]);
      } catch (err) {
        console.error('Erreur lors du chargement des référents:', err);
        setError(t('dashboard.referents.error'));
      } finally {
        setLoading(false);
      }
    };

    loadReferents();
  }, [currentUser, isJeune, t]);

  if (!isJeune) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.referents.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={50} height={50} />
            <Box sx={{ ml: 2 }}>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={180} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.referents.title')}
          </Typography>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.referents.title')}
        </Typography>

        {referents.length === 0 ? (
          <Typography>{t('dashboard.referents.none')}</Typography>
        ) : (
          <Grid container spacing={2}>
            {referents.map((referent) => (
              <Grid item xs={12} sm={6} key={referent.uid}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={referent.photoURL}
                    alt={referent.displayName}
                    sx={{ width: 50, height: 50 }}
                  >
                    {referent.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">{referent.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(`roles.${referent.role}`)}
                    </Typography>
                    {referent.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Link href={`mailto:${referent.email}`} underline="hover">
                          {referent.email}
                        </Link>
                      </Box>
                    )}
                    {referent.phoneNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Link href={`tel:${referent.phoneNumber}`} underline="hover">
                          {referent.phoneNumber}
                        </Link>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
