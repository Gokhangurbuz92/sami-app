import { useEffect, useState } from "react";
import { Box, Container, Typography, Grid, Card, CardContent, CardHeader, IconButton, Avatar, Stack, Link, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import NoteIcon from '@mui/icons-material/Note';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchReferents } from "../services/referents";
import { userService } from "../services/userService";
import AssignedYouths from '../components/AssignedYouths';
import { getOrCreateConversation } from "../services/getOrCreateConversation";

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser, isJeune, isReferent } = useAuth();
  const [referents, setReferents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Charger les référents du jeune
  useEffect(() => {
    const loadReferents = async () => {
      if (!currentUser || !isJeune) {
        setLoading(false);
        return;
      }
      
      try {
        // Récupérer les données utilisateur de Firestore
        const userData = await userService.getUserById(currentUser.uid);
        setUser(userData);
        
        if (userData?.assignedReferents?.length) {
          const data = await fetchReferents(userData.assignedReferents);
          setReferents(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des référents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReferents();
  }, [currentUser, isJeune]);

  const handleMessageReferent = async () => {
    if (user?.assignedReferents?.length > 0 && currentUser) {
      const firstReferent = user.assignedReferents[0]; // ou afficher une liste
      const conversationId = await getOrCreateConversation(currentUser.uid, firstReferent);
      navigate(`/messaging?conversation=${conversationId}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("dashboard.title")}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {t("dashboard.welcome")}
        </Typography>

        {/* Afficher les référents assignés seulement pour les jeunes */}
        {isJeune && (
          <Box sx={{ mb: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("dashboard.referents.title")}
                </Typography>

                {loading ? (
                  <Typography>{t("common.loading")}</Typography>
                ) : referents.length === 0 ? (
                  <Typography>
                    {t("dashboard.referents.none")}
                  </Typography>
                ) : (
                  <>
                    {user?.assignedReferents?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Button variant="contained" onClick={handleMessageReferent}>
                          {t("dashboard.referents.contact")}
                        </Button>
                      </Box>
                    )}
                    <Stack spacing={2}>
                      {referents.map((referent) => (
                        <Box key={referent.uid} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={referent.photoURL} 
                            alt={referent.displayName}
                            sx={{ width: 50, height: 50 }}
                          >
                            {referent.displayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle1">
                              {referent.displayName}
                            </Typography>
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
                      ))}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Afficher les jeunes assignés seulement pour les référents */}
        {isReferent && (
          <Box sx={{ mb: 4 }}>
            <AssignedYouths />
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Widget Planning */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title={t("dashboard.upcomingEvents")}
                avatar={<EventIcon />}
                action={
                  <IconButton component={RouterLink} to="/planning">
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
                  <IconButton component={RouterLink} to="/messaging">
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
                  <IconButton component={RouterLink} to="/notes">
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
                  <IconButton component={RouterLink} to="/notifications">
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