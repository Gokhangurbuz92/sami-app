import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home,
  Chat,
  Event,
  School,
  Person,
  AdminPanelSettings,
} from '@mui/icons-material';
import { LanguageSelector } from './LanguageSelector';

const navigationItems = [
  { path: '/home', icon: <Home />, label: 'navigation.home' },
  { path: '/chat', icon: <Chat />, label: 'navigation.chat' },
  { path: '/appointments', icon: <Event />, label: 'navigation.appointments' },
  { path: '/education', icon: <School />, label: 'navigation.education' },
  { path: '/profile', icon: <Person />, label: 'navigation.profile' },
];

export const Navigation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const navigationContent = (
    <>
      {navigationItems.map((item) => (
        <ListItem
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          sx={{
            cursor: 'pointer',
            bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={t(item.label)} />
        </ListItem>
      ))}
      {profile?.role === 'admin' && (
        <ListItem
          onClick={() => handleNavigation('/admin')}
          sx={{
            cursor: 'pointer',
            bgcolor: location.pathname === '/admin' ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>
            <AdminPanelSettings />
          </ListItemIcon>
          <ListItemText primary={t('navigation.admin')} />
        </ListItem>
      )}
      <ListItem>
        <LanguageSelector />
      </ListItem>
    </>
  );

  if (isMobile) {
    return (
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          value={location.pathname}
          onChange={(_, newValue) => handleNavigation(newValue)}
          showLabels
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={t(item.label)}
              icon={item.icon}
              value={item.path}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>{navigationContent}</List>
      </Box>
    </Drawer>
  );
}; 