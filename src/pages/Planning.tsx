import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

interface CustomEvent extends CalendarEvent {
  category?: string;
  description?: string;
}

const eventCategories = [
  { id: 'medical', name: 'rdv_medical', color: '#ff4444' },
  { id: 'school', name: 'school', color: '#4444ff' },
  { id: 'admin', name: 'rdv_administrative', color: '#44ff44' },
  { id: 'cleaning', name: 'cleaning_room', color: '#ff8844' },
  { id: 'laundry', name: 'laundry', color: '#8844ff' },
  { id: 'other', name: 'other', color: '#888888' }
];

interface EventFormData {
  title: string;
  start: string;
  end: string;
  category: string;
  description: string;
}

export default function Planning() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    start: '',
    end: '',
    category: '',
    description: ''
  });

  const localizer = momentLocalizer(moment);

  const messages = {
    allDay: t('planning.allDay'),
    previous: t('planning.previous'),
    next: t('planning.next'),
    today: t('planning.today'),
    month: t('planning.month'),
    week: t('planning.week'),
    day: t('planning.day'),
    agenda: t('planning.agenda'),
    date: t('planning.date'),
    time: t('planning.time'),
    event: t('planning.event'),
    noEventsInRange: t('planning.noEventsInRange'),
    showMore: (total: number) => t('planning.showMore', { count: total })
  };

  const eventStyleGetter = (event: CustomEvent) => {
    const category = eventCategories.find((cat) => cat.id === event.category) || eventCategories[5];
    return {
      style: {
        backgroundColor: category.color,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 5px'
      }
    };
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      start: '',
      end: '',
      category: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    const newEvent: CustomEvent = {
      title: formData.title,
      start: new Date(formData.start),
      end: new Date(formData.end),
      category: formData.category,
      description: formData.description
    };
    setEvents((prev) => [...prev, newEvent]);
    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              {t('planning.title')}
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              {t('planning.addEvent')}
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            aria-label="calendar view"
          >
            <ToggleButton value="day" aria-label="day view">
              {t('planning.day')}
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              {t('planning.week')}
            </ToggleButton>
            <ToggleButton value="month" aria-label="month view">
              {t('planning.month')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          view={view}
          onView={(newView) => setView(newView as 'day' | 'week' | 'month')}
          messages={messages}
          eventPropGetter={eventStyleGetter}
          culture={i18n.language}
        />

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{t('planning.addEvent')}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('planning.event')}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label={t('planning.date')}
                name="start"
                type="datetime-local"
                value={formData.start}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('planning.date')}
                name="end"
                type="datetime-local"
                value={formData.end}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label={t('planning.categories.title')}
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                fullWidth
              >
                {eventCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {t(`planning.categories.${category.name}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t('planning.description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
