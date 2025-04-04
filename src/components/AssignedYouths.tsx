import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Link,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { fetchYouths } from '../services/youths';
import { Email as EmailIcon, Message as MessageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Type pour un jeune
interface Jeune {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export default function AssignedYouths() {
  const { currentUser, isReferent } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jeunes, setJeunes] = useState<Jeune[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJeunes = async () => {
      if (!currentUser || !isReferent) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les données du référent pour obtenir les jeunes assignés
        const referentDoc = await userService.getUserById(currentUser.uid);

        if (
          !referentDoc ||
          !referentDoc.assignedYouths ||
          referentDoc.assignedYouths.length === 0
        ) {
          setJeunes([]);
          setLoading(false);
          return;
        }

        // Utiliser fetchYouths pour obtenir les détails des jeunes
        const jeunesList = await fetchYouths(referentDoc.assignedYouths);
        setJeunes(jeunesList as Jeune[]);
      } catch (err) {
        console.error('Erreur lors du chargement des jeunes:', err);
        setError(t('dashboard.youths.error'));
      } finally {
        setLoading(false);
      }
    };

    loadJeunes();
  }, [currentUser, isReferent, t]);

  // Fonction pour démarrer une conversation avec un jeune
  const startConversation = (jeuneId: string) => {
    navigate(`/messaging?userId=${jeuneId}`);
  };

  if (!isReferent) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.youths.title')}
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
            {t('dashboard.youths.title')}
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
          {t('dashboard.youths.title')}
        </Typography>

        {jeunes.length === 0 ? (
          <Typography>{t('dashboard.youths.none')}</Typography>
        ) : (
          <Grid container spacing={2}>
            {jeunes.map((jeune) => (
              <Grid item xs={12} sm={6} md={4} key={jeune.uid}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={jeune.photoURL}
                        alt={jeune.displayName}
                        sx={{ width: 50, height: 50 }}
                      >
                        {jeune.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="subtitle1">{jeune.displayName}</Typography>
                        {jeune.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Link href={`mailto:${jeune.email}`} underline="hover">
                              {jeune.email}
                            </Link>
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        color="primary"
                        onClick={() => startConversation(jeune.uid)}
                        aria-label={t('dashboard.youths.message')}
                      >
                        <MessageIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
