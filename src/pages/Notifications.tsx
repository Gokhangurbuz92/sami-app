import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function Notifications() {
  const { t } = useTranslation();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('navigation.notifications')}
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Nouveau rendez-vous"
                  secondary="Un nouveau rendez-vous a été planifié pour demain"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mise à jour du profil"
                  secondary="Le profil d'un jeune a été mis à jour"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Nouvelle note"
                  secondary="Une nouvelle note a été ajoutée"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 