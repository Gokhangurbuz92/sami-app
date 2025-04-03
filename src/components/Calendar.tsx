import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../services/appointmentService';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Typography, Snackbar, Alert } from '@mui/material';

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    description: string;
    status: string;
  };
}

const localizer = momentLocalizer(moment);

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description: string;
    start: string;
    end: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    participants: string[];
  }>({
    title: '',
    description: '',
    start: '',
    end: '',
    status: 'scheduled',
    participants: [],
  });

  // Constantes de validation
  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 500;
  const MAX_PARTICIPANTS = 10;
  const MIN_EVENT_DURATION = 30; // minutes

  // Fonction pour afficher les notifications
  const showNotification = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Fonction pour valider un événement
  const validateEvent = (event: typeof newEvent): boolean => {
    if (!event.title.trim()) {
      showNotification(t('calendar.errors.titleRequired'), 'error');
      return false;
    }

    if (event.title.length > MAX_TITLE_LENGTH) {
      showNotification(t('calendar.errors.titleTooLong'), 'error');
      return false;
    }

    if (event.description.length > MAX_DESCRIPTION_LENGTH) {
      showNotification(t('calendar.errors.descriptionTooLong'), 'error');
      return false;
    }

    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      showNotification(t('calendar.errors.invalidDates'), 'error');
      return false;
    }

    if (startDate >= endDate) {
      showNotification(t('calendar.errors.endBeforeStart'), 'error');
      return false;
    }

    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // en minutes
    if (duration < MIN_EVENT_DURATION) {
      showNotification(t('calendar.errors.tooShort'), 'error');
      return false;
    }

    if (event.participants.length > MAX_PARTICIPANTS) {
      showNotification(t('calendar.errors.tooManyParticipants'), 'error');
      return false;
    }

    return true;
  };

  const loadAppointments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const appointments = await appointmentService.getAppointments(user.uid);
      const calendarEvents = appointments.map(appointment => ({
        title: appointment.title,
        start: appointment.start,
        end: appointment.end,
        resource: {
          id: appointment.id || '',
          description: appointment.description,
          status: appointment.status
        }
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showNotification(t('calendar.errors.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setNewEvent({
      title: '',
      description: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      status: 'scheduled',
      participants: [],
    });
    setOpenDialog(true);
  };

  const handleEventClick = async (clickInfo: any) => {
    if (window.confirm(t('calendar.confirmDelete'))) {
      try {
        await appointmentService.deleteAppointment(clickInfo.event.id);
        setEvents(events.filter(event => event.resource.id !== clickInfo.event.id));
        showNotification(t('calendar.success.delete'), 'success');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        showNotification(t('calendar.errors.deleteError'), 'error');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDate(null);
    setError(null);
    setSuccess(null);
  };

  const handleAddEvent = async () => {
    if (!validateEvent(newEvent)) return;

    try {
      const appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newEvent.title.trim(),
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        description: newEvent.description.trim(),
        status: newEvent.status,
        participants: newEvent.participants,
        createdBy: user?.uid || '',
      };

      await appointmentService.createAppointment(appointment);
      await loadAppointments();
      handleDialogClose();
      showNotification(t('calendar.success.create'), 'success');
    } catch (error) {
      console.error('Error creating appointment:', error);
      showNotification(t('calendar.errors.createError'), 'error');
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#1976d2';
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={5000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar
          open={Boolean(success)}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        onSelectSlot={handleDateSelect}
        onSelectEvent={handleEventClick}
        height="auto"
        loading={loading}
      />

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('calendar.addEvent')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('calendar.eventTitle')}
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            error={newEvent.title.length > MAX_TITLE_LENGTH}
            helperText={newEvent.title.length > MAX_TITLE_LENGTH ? t('calendar.errors.titleTooLong') : ''}
          />
          <TextField
            margin="dense"
            label={t('calendar.eventDescription')}
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            error={newEvent.description.length > MAX_DESCRIPTION_LENGTH}
            helperText={newEvent.description.length > MAX_DESCRIPTION_LENGTH ? t('calendar.errors.descriptionTooLong') : ''}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('calendar.eventStatus')}</InputLabel>
            <Select
              value={newEvent.status}
              label={t('calendar.eventStatus')}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'scheduled' | 'completed' | 'cancelled' })}
            >
              <MenuItem value="scheduled">{t('calendar.statusScheduled')}</MenuItem>
              <MenuItem value="completed">{t('calendar.statusCompleted')}</MenuItem>
              <MenuItem value="cancelled">{t('calendar.statusCancelled')}</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('calendar.participants')} ({newEvent.participants.length}/{MAX_PARTICIPANTS})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {newEvent.participants.map((participant, index) => (
                <Chip
                  key={index}
                  label={participant}
                  onDelete={() => {
                    setNewEvent({
                      ...newEvent,
                      participants: newEvent.participants.filter((_, i) => i !== index),
                    });
                  }}
                />
              ))}
            </Box>
            <TextField
              margin="dense"
              label={t('calendar.addParticipant')}
              fullWidth
              error={newEvent.participants.length >= MAX_PARTICIPANTS}
              helperText={newEvent.participants.length >= MAX_PARTICIPANTS ? t('calendar.errors.tooManyParticipants') : ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim() && newEvent.participants.length < MAX_PARTICIPANTS) {
                    setNewEvent({
                      ...newEvent,
                      participants: [...newEvent.participants, input.value.trim()],
                    });
                    input.value = '';
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleAddEvent} 
            variant="contained" 
            color="primary"
            disabled={!newEvent.title.trim()}
          >
            {t('common.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 