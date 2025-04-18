/// <reference types="vite/client" />
/// <reference lib="dom" />
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n, { getTextDirection } from './i18n/config';
import { createTheme } from '@mui/material/styles';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { MainNavigation } from './components/MainNavigation';
import { AnimatePresence } from 'framer-motion';
import AnimatedRoute from './components/AnimatedRoute';
import { initializeCapacitorPlugins } from './services/capacitorService';
import { AdminRoute as RoleAdminRoute, PermissionRoute } from './components/RouteGuards';
import AdminRoute from './components/Admin/AdminRoute';
import EmailVerification from './components/EmailVerification';
import InstallPWA from './components/InstallPWA';
import OfflineStatus from './components/OfflineStatus';
import UserManagement from './components/UserManagement';
import AdminPanel from './components/Admin/AdminPanel';
import { captureMessage } from './config/sentry';
import './styles/SentryTestButton.css';
import { User } from './types';
import { User as FirebaseUser } from 'firebase/auth';

// Importation paresseuse des pages
import {
  LazyDashboard,
  LazyPlanning,
  LazyNotes,
  LazyProfile,
  LazyNotifications,
  LazyMessagingPage,
  LazyLogin,
  LazyAdminAssignation,
  LazyDailyLife,
  preloadCriticalPages
} from './pages/LazyPages';

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
            textTransform: 'none',
            borderRadius: '8px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px'
          }
        }
      }
    }
  });

const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || '',
  photoURL: firebaseUser.photoURL || undefined,
  role: 'jeune', // Par défaut, on met 'jeune' comme rôle
  createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
  updatedAt: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date()
});

// Composant d'animation pour les routes
function AnimatedRoutes() {
  const location = useLocation();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <AnimatedRoute transitionKey="login">
            <LazyLogin />
          </AnimatedRoute>
        } />
        <Route path="/email-verification" element={
          <AnimatedRoute transitionKey="email-verification">
            <EmailVerification />
          </AnimatedRoute>
        } />
        
        {/* Routes protégées nécessitant l'authentification */}
        {currentUser ? (
          <>
            {/* Si l'email n'est pas vérifié, rediriger vers la page de vérification */}
            {!currentUser.emailVerified ? (
              <Route path="*" element={<Navigate to="/email-verification" replace />} />
            ) : (
              <>
                <Route path="/" element={
                  <AnimatedRoute transitionKey="dashboard">
                    <MainNavigation />
                    <LazyDashboard user={convertFirebaseUser(currentUser)} />
                  </AnimatedRoute>
                } />
                <Route path="/profile" element={
                  <AnimatedRoute transitionKey="profile">
                    <MainNavigation />
                    <LazyProfile />
                  </AnimatedRoute>
                } />

                {/* Routes communes aux jeunes et aux référents */}
                <Route
                  path="/planning"
                  element={
                    <PermissionRoute requiredPermission="canAccessAppointments">
                      <AnimatedRoute transitionKey="planning">
                        <MainNavigation />
                        <LazyPlanning />
                      </AnimatedRoute>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <PermissionRoute requiredPermission="canAccessNotes">
                      <AnimatedRoute transitionKey="notes">
                        <MainNavigation />
                        <LazyNotes />
                      </AnimatedRoute>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PermissionRoute requiredPermission="canAccessNotifications">
                      <AnimatedRoute transitionKey="notifications">
                        <MainNavigation />
                        <LazyNotifications />
                      </AnimatedRoute>
                    </PermissionRoute>
                  }
                />

                {/* Routes spécifiques aux jeunes et référents qui peuvent accéder à la messagerie */}
                <Route
                  path="/messaging"
                  element={
                    <PermissionRoute requiredPermission="canAccessMessaging">
                      <AnimatedRoute transitionKey="messaging">
                        <MainNavigation />
                        <LazyMessagingPage />
                      </AnimatedRoute>
                    </PermissionRoute>
                  }
                />

                {/* Route pour la vie quotidienne */}
                <Route
                  path="/daily-life"
                  element={
                    <AnimatedRoute transitionKey="daily-life">
                      <MainNavigation />
                      <LazyDailyLife />
                    </AnimatedRoute>
                  }
                />

                {/* Routes spécifiques aux administrateurs */}
                <Route
                  path="/admin/users"
                  element={
                    <RoleAdminRoute>
                      <AnimatedRoute transitionKey="admin-users">
                        <MainNavigation />
                        <UserManagement />
                      </AnimatedRoute>
                    </RoleAdminRoute>
                  }
                />

                <Route
                  path="/admin-assignation"
                  element={
                    <RoleAdminRoute>
                      <AnimatedRoute transitionKey="admin-assignation">
                        <MainNavigation />
                        <LazyAdminAssignation />
                      </AnimatedRoute>
                    </RoleAdminRoute>
                  }
                />
                
                {/* Nouveau panneau d'administration */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route index element={
                    <AnimatedRoute transitionKey="admin-panel">
                      <MainNavigation />
                      <AdminPanel />
                    </AnimatedRoute>
                  } />
                </Route>

                {/* Redirection par défaut en fonction du rôle */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
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

  // Initialisation des plugins Capacitor et préchargement des pages critiques
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Initialiser les plugins Capacitor
        await initializeCapacitorPlugins();
        console.log('Capacitor plugins initialized successfully');
        
        // Précharger les pages critiques
        preloadCriticalPages();
      } catch (error) {
        console.error('Failed to initialize Capacitor plugins:', error);
      }
    };

    setupApp();
  }, []);

  const testSentry = () => {
    captureMessage('Test de notification Sentry', 'info');
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <OfflineStatus />
        <AnimatedRoutes />
        <InstallPWA />
        <button onClick={testSentry} className="sentry-test-button">
          Test Sentry
        </button>
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
