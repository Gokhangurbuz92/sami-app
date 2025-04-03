import { Box, Container, Typography, Grid, Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import NoteIcon from '@mui/icons-material/Note';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("dashboard.title")}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {t("dashboard.welcome")}
        </Typography>

        <Grid container spacing={3}>
          {/* Widget Planning */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title={t("dashboard.upcomingEvents")}
                avatar={<EventIcon />}
                action={
                  <IconButton component={Link} to="/planning">
                    <EventIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.noUpcomingEvents")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Widget Messages */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title={t("dashboard.unreadMessages")}
                avatar={<MessageIcon />}
                action={
                  <IconButton component={Link} to="/messaging">
                    <MessageIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.noUnreadMessages")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Widget Notes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title={t("dashboard.recentNotes")}
                avatar={<NoteIcon />}
                action={
                  <IconButton component={Link} to="/notes">
                    <NoteIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.noRecentNotes")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Widget Notifications */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title={t("dashboard.importantNotifications")}
                avatar={<NotificationsIcon />}
                action={
                  <IconButton component={Link} to="/notifications">
                    <NotificationsIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.noImportantNotifications")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 