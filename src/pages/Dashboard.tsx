import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { User, Referent } from '../types';
import { userService } from '../services/userService';
import Calendar from '../components/Calendar';
import NotesList from '../components/NotesList';
import Messaging from '../components/Messaging';
import { useSnackbar } from 'notistack';

interface DashboardData {
  appointments: number;
  messages: number;
  tasks: number;
  notes: number;
}

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [_referents, setReferents] = useState<Referent[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    appointments: 0,
    messages: 0,
    tasks: 0,
    notes: 0
  });

  useEffect(() => {
    const loadReferents = async () => {
      try {
        const response = await userService.fetchReferents();
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          setReferents(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des référents:', error);
        enqueueSnackbar(t('errors.loadReferents'), { variant: 'error' });
      }
    };

    loadReferents();
  }, [enqueueSnackbar, t]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching dashboard data:', error.message);
          enqueueSnackbar(t('errors.loadDashboard'), { variant: 'error' });
        }
      }
    };

    fetchDashboardData();
  }, [enqueueSnackbar, t]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>

      {/* Test Sentry Button */}
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={() => { throw new Error("Erreur test Sentry SAMI") }}
        >
          Tester Sentry
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{t('dashboard.appointments')}</Typography>
            <Typography variant="h4">{dashboardData.appointments}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{t('dashboard.messages')}</Typography>
            <Typography variant="h4">{dashboardData.messages}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{t('dashboard.tasks')}</Typography>
            <Typography variant="h4">{dashboardData.tasks}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{t('dashboard.notes')}</Typography>
            <Typography variant="h4">{dashboardData.notes}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Calendar />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <NotesList userId={user.id} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Messaging _conversationId="" _onClose={() => {}} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
