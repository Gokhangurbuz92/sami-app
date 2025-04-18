import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

declare global {
  interface Window {
    ResizeObserver: ResizeObserver;
  }
  // eslint-disable-next-line no-var
  var ResizeObserver: typeof ResizeObserver;
}

// Mock des fonctions Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({
    name: '[DEFAULT]',
    options: {}
  }))
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn(date => ({ toDate: () => date }))
  }
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({
    ref: vi.fn(),
    upload: vi.fn(),
    getDownloadURL: vi.fn()
  })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({
    getToken: vi.fn(),
    onMessage: vi.fn(),
    onBackgroundMessage: vi.fn()
  })),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  onBackgroundMessage: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(true))
}));

// Mock des fonctions Material-UI
vi.mock('@mui/material', () => {
  const actual = vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
    Box: vi.fn(({ children }) => children),
    TextField: vi.fn(({ children }) => children),
    Button: vi.fn(({ children }) => children),
    CircularProgress: vi.fn(() => null),
    Typography: vi.fn(({ children }) => children),
    List: vi.fn(({ children }) => children),
    ListItem: vi.fn(({ children }) => children),
    ListItemText: vi.fn(({ children }) => children),
    Dialog: vi.fn(({ children }) => children),
    DialogTitle: vi.fn(({ children }) => children),
    DialogContent: vi.fn(({ children }) => children),
    DialogContentText: vi.fn(({ children }) => children),
    DialogActions: vi.fn(({ children }) => children),
    Alert: vi.fn(({ children }) => children),
    Snackbar: vi.fn(({ children }) => children)
  };
});

interface IconComponents {
  [key: string]: () => null;
}

vi.mock('@mui/icons-material', () => {
  const icons: IconComponents = {};
  const handler = {
    get: (_target: IconComponents, prop: string) => {
      if (!(prop in icons)) {
        icons[prop] = vi.fn(() => null);
      }
      return icons[prop];
    }
  };
  return new Proxy(icons, handler);
});

// Mock des fonctions i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'fr'
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn()
  }
}));

// Mock des fonctions Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web')
  }
}));

vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    register: vi.fn(),
    addListener: vi.fn(),
    getDeliveredNotifications: vi.fn()
  }
}));

// Configuration globale
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

globalThis.ResizeObserver = mockResizeObserver;

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
}); 