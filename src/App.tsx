import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n, { getTextDirection } from './i18n/config';
import { createTheme } from '@mui/material/styles';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { MainNavigation } from './components/MainNavigation';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Notes from './pages/Notes';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import InstallPWA from './components/InstallPWA';
import OfflineStatus from './components/OfflineStatus';
import MessagingPage from './pages/MessagingPage';
import UserManagement from './components/UserManagement';
import AdminAssignation from './pages/AdminAssignation';
import { AdminRoute, PermissionRoute } from './components/RouteGuards';

// Création du thème avec support RTL
const createAppTheme = (direction: 'ltr' | 'rtl') =>
  createTheme({
    direction,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none'
          }
        }
      }
    }
  });

function AppContent() {
  const { currentUser } = useAuth();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const theme = createAppTheme(direction);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newDirection = getTextDirection(i18n.language);
      setDirection(newDirection);
      document.dir = newDirection;
    };

    i18n.on('languageChanged', handleLanguageChange);
    handleLanguageChange();

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <OfflineStatus />
        {currentUser ? (
          <>
            <MainNavigation />
            <Routes>
              {/* Route commune à tous les utilisateurs */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Routes communes aux jeunes et aux référents */}
              <Route
                path="/planning"
                element={
                  <PermissionRoute requiredPermission="canAccessAppointments">
                    <Planning />
                  </PermissionRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <PermissionRoute requiredPermission="canAccessNotes">
                    <Notes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PermissionRoute requiredPermission="canAccessNotifications">
                    <Notifications />
                  </PermissionRoute>
                }
              />

              {/* Routes spécifiques aux jeunes et référents qui peuvent accéder à la messagerie */}
              <Route
                path="/messaging"
                element={
                  <PermissionRoute requiredPermission="canAccessMessaging">
                    <MessagingPage />
                  </PermissionRoute>
                }
              />

              {/* Routes spécifiques aux administrateurs */}
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin-assignation"
                element={
                  <AdminRoute>
                    <AdminAssignation />
                  </AdminRoute>
                }
              />

              {/* Redirection par défaut en fonction du rôle */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        ) : (
          <Login />
        )}
        <InstallPWA />
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
