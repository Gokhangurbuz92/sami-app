import { LazyLoad, preloadComponent } from '../utils/LazyImport';

// Pages principales
export const LazyDashboard = LazyLoad(() => import('./Dashboard'));
export const LazyPlanning = LazyLoad(() => import('./Planning'));
export const LazyNotes = LazyLoad(() => import('./Notes'));
export const LazyProfile = LazyLoad(() => import('./Profile'));
export const LazyNotifications = LazyLoad(() => import('./Notifications'));
export const LazyMessagingPage = LazyLoad(() => import('./MessagingPage'));
export const LazyLogin = LazyLoad(() => import('./Login'));
export const LazyAdminAssignation = LazyLoad(() => import('./AdminAssignation'));
export const LazyDailyLife = LazyLoad(() => import('./DailyLife'));

// Préchargement des pages critiques
export const preloadCriticalPages = () => {
  // Précharger le tableau de bord et la page de connexion dès le démarrage
  preloadComponent(() => import('./Dashboard'));
  preloadComponent(() => import('./Login'));
}; 