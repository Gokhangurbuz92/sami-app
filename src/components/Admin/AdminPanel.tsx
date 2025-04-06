import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Divider, Button, List, 
  ListItem, ListItemText, Chip, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BugReportIcon from '@mui/icons-material/BugReport';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { captureMessage } from '../../config/sentry';

// Définition des types
interface FirebaseStatus {
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  messaging: boolean;
}

interface ErrorEntry {
  id: string;
  message: string;
  timestamp: Date;
  type: string;
}

// Composant principal de l'administration
const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>({
    auth: false,
    firestore: false,
    storage: false,
    messaging: false
  });
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    const initAdminPanel = async () => {
      try {
        setLoading(true);
        await checkFirebaseStatus();
        await loadErrors();
        loadAppVersion();
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du panneau admin:', error);
        setLoading(false);
      }
    };

    initAdminPanel();
  }, []);

  // Vérifier l'état des services Firebase
  const checkFirebaseStatus = async () => {
    const status: FirebaseStatus = {
      auth: false,
      firestore: false,
      storage: false,
      messaging: false
    };

    try {
      // Vérifier Auth
      const auth = getAuth();
      status.auth = !!auth;

      // Vérifier Firestore
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(query(usersCollection, limit(1)));
      status.firestore = !userSnapshot.empty || userSnapshot.empty; // Vrai dans les deux cas, on vérifie juste que la requête fonctionne

      // Vérifier Storage
      const storage = getStorage();
      const rootRef = ref(storage);
      await listAll(rootRef);
      status.storage = true;

      // Vérifier Messaging (uniquement si sur appareil natif)
      if (Capacitor.isNativePlatform()) {
        const messaging = getMessaging();
        try {
          await getToken(messaging);
          status.messaging = true;
        } catch (e) {
          status.messaging = false;
        }
      }

      setFirebaseStatus(status);
    } catch (error) {
      console.error('Erreur lors de la vérification des services Firebase:', error);
    }
  };

  // Charger les erreurs (simulé car nous n'avons pas encore Crashlytics)
  const loadErrors = async () => {
    try {
      // Dans une implémentation réelle, nous chargerions les données de Crashlytics
      // Pour l'instant, nous utilisons un exemple statique
      setErrors([
        {
          id: '1',
          message: 'Exemple d\'erreur - Sera remplacé par de vraies données de Crashlytics',
          timestamp: new Date(),
          type: 'Exception'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des erreurs:', error);
    }
  };

  // Charger la version de l'application
  const loadAppVersion = () => {
    const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
    setAppVersion(version);
  };

  // Tester une notification push
  const testPushNotification = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const messaging = getMessaging();
        const token = await getToken(messaging);
        setFcmToken(token);
        
        // Dans un cas réel, nous enverrions ce token à notre serveur pour envoyer une notification
        // Pour l'instant, nous affichons simplement un toast
        await Toast.show({
          text: 'Token FCM obtenu: ' + token.substring(0, 10) + '...',
          duration: 'long'
        });
        
        // Enregistrer dans Sentry pour démonstration
        captureMessage('Test push notification token retrieved', 'info');
      } else {
        await Toast.show({
          text: 'Les notifications push nécessitent un appareil mobile',
          duration: 'long'
        });
      }
    } catch (error) {
      console.error('Erreur lors du test de notification push:', error);
      await Toast.show({
        text: 'Erreur de notification push: ' + String(error),
        duration: 'long'
      });
    }
  };

  // Rafraîchir la configuration Firebase
  const refreshFirebaseConfig = async () => {
    try {
      setLoading(true);
      // Réinitialiser les statuts
      await checkFirebaseStatus();
      await Toast.show({
        text: 'Configuration Firebase rafraîchie',
        duration: 'short'
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la configuration:', error);
      setLoading(false);
    }
  };

  // Si chargement en cours
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Panneau d'Administration
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Accès réservé aux administrateurs
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Informations de l'application */}
        <Typography variant="h6" gutterBottom>
          Informations de l'application
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Version" secondary={appVersion} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Plateforme" 
              secondary={Capacitor.isNativePlatform() ? `Native (${Capacitor.getPlatform()})` : 'Web'} 
            />
          </ListItem>
        </List>

        {/* Status des services Firebase */}
        <Accordion defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Status Firebase</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Auth:</Typography>
                  <Chip 
                    label={firebaseStatus.auth ? "Connecté" : "Déconnecté"} 
                    color={firebaseStatus.auth ? "success" : "error"} 
                    size="small" 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Firestore:</Typography>
                  <Chip 
                    label={firebaseStatus.firestore ? "Connecté" : "Déconnecté"} 
                    color={firebaseStatus.firestore ? "success" : "error"} 
                    size="small" 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Storage:</Typography>
                  <Chip 
                    label={firebaseStatus.storage ? "Connecté" : "Déconnecté"} 
                    color={firebaseStatus.storage ? "success" : "error"} 
                    size="small" 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Messaging:</Typography>
                  <Chip 
                    label={firebaseStatus.messaging ? "Connecté" : "Non configuré"} 
                    color={firebaseStatus.messaging ? "success" : "warning"} 
                    size="small" 
                  />
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Dernières erreurs */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dernières Erreurs</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {errors.length > 0 ? (
              <List dense>
                {errors.map((error) => (
                  <ListItem key={error.id}>
                    <ListItemText 
                      primary={error.message} 
                      secondary={`${error.type} | ${error.timestamp.toLocaleString()}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">Aucune erreur récente</Alert>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Actions */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<NotificationsIcon />} 
            onClick={testPushNotification}
          >
            Tester les notifications push
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={refreshFirebaseConfig}
          >
            Rafraîchir la configuration Firebase
          </Button>
          
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<BugReportIcon />} 
            onClick={() => captureMessage("Test d'erreur depuis le panneau d'administration", 'warning')}
          >
            Tester le suivi d'erreurs
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel; 