import React, { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  ListItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  CalendarMonth,
  Logout,
  People,
  Note,
  Notifications as NotificationsIcon,
  AccountCircle,
  Chat
} from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LanguageSelector from './LanguageSelector';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permissionRequired?: string;
  roles?: string[];
}

export function MainNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout, checkPermission, isAdmin, isReferent, isJeune } = useAuth();

  // Définition des éléments de menu avec leurs permissions
  const allMenuItems: MenuItem[] = [
    {
      text: t('navigation.home'),
      icon: <Home />,
      path: '/',
      permissionRequired: 'canAccessDashboard'
    },
    {
      text: `📅 ${t('navigation.planning')}`,
      icon: <CalendarMonth />,
      path: '/planning',
      permissionRequired: 'canAccessAppointments'
    },
    {
      text: `📝 ${t('navigation.notes')}`,
      icon: <Note />,
      path: '/notes',
      permissionRequired: 'canAccessNotes'
    },
    {
      text: `🔔 ${t('navigation.notifications')}`,
      icon: <NotificationsIcon />,
      path: '/notifications',
      permissionRequired: 'canAccessNotifications'
    },
    {
      text: `👤 ${t('navigation.profile')}`,
      icon: <AccountCircle />,
      path: '/profile'
    },
    {
      text: `✉️ ${t('navigation.messaging')}`,
      icon: <Chat />,
      path: '/messaging',
      permissionRequired: 'canAccessMessaging',
      roles: ['jeune', 'referent', 'coreferent'] // Exclure les admins
    },
    {
      text: t('navigation.userManagement'),
      icon: <People />,
      path: '/admin/users',
      permissionRequired: 'canAccessUserManagement',
      roles: ['admin']
    }
  ];

  // Filtrer les éléments de menu en fonction des permissions de l'utilisateur
  const filteredMenuItems = allMenuItems.filter((item) => {
    // Si aucune permission ou rôle n'est requis, afficher l'élément
    if (!item.permissionRequired && !item.roles) {
      return true;
    }

    // Vérifier les permissions si spécifiées
    if (item.permissionRequired && !checkPermission(item.permissionRequired as any)) {
      return false;
    }

    // Vérifier les rôles si spécifiés
    if (item.roles) {
      if (isAdmin && item.roles.includes('admin')) {
        return true;
      }
      if (isReferent && (item.roles.includes('referent') || item.roles.includes('coreferent'))) {
        return true;
      }
      if (isJeune && item.roles.includes('jeune')) {
        return true;
      }
      if (!isAdmin && !isReferent && !isJeune) {
        return false;
      }
    }

    return true;
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItemButton key={item.text} onClick={() => handleNavigation(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        {isAdmin && (
          <ListItem button component={Link} to="/admin-assignation">
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Assignation" />
          </ListItem>
        )}

        <Divider />
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary={t('common.logout')} />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <LanguageSelector />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
