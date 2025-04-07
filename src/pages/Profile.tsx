import { Box, Paper, Typography, Grid, Avatar, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {user?.email?.[0].toUpperCase()}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.email}
              </Typography>
              <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
                {t('common.logout')}
              </Button>
            </Box>

            {/* Informations supplémentaires à venir */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Informations du profil
              </Typography>
              <Typography color="text.secondary">Plus d&apos;informations à venir...</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
