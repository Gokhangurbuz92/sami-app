#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des constantes ===${NC}"

# Configurer les constantes de thème
echo -e "${YELLOW}Configuration des constantes de thème...${NC}"
cat > src/constants/theme.ts << 'EOL'
export const LIGHT_THEME = {
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#ffffff',
  surface: '#f5f5f5',
  error: '#b00020',
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

export const DARK_THEME = {
  primary: '#90caf9',
  secondary: '#f48fb1',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#cf6679',
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 16,
  round: 9999,
};
EOL

# Configurer les constantes de langues
echo -e "${YELLOW}Configuration des constantes de langues...${NC}"
cat > src/constants/languages.ts << 'EOL'
export const LANGUAGES = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
  },
  {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
  },
];

export const DEFAULT_LANGUAGE = 'fr';

export const LANGUAGE_DETECTION_OPTIONS = {
  order: ['navigator', 'htmlTag', 'path', 'subdomain'],
  caches: ['localStorage', 'cookie'],
};
EOL

# Configurer les constantes de routes
echo -e "${YELLOW}Configuration des constantes de routes...${NC}"
cat > src/constants/routes.ts << 'EOL'
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  CHAT: {
    LIST: '/chat',
    PRIVATE: '/chat/private/:id',
    GROUP: '/chat/group/:id',
    PROFESSIONAL: '/chat/professional/:id',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    REPORTS: '/admin/reports',
  },
  SETTINGS: {
    PROFILE: '/settings/profile',
    NOTIFICATIONS: '/settings/notifications',
    LANGUAGE: '/settings/language',
    THEME: '/settings/theme',
  },
  EDUCATIONAL: {
    LIST: '/educational',
    TOPIC: '/educational/:id',
  },
};

export const PROTECTED_ROUTES = [
  ROUTES.CHAT.LIST,
  ROUTES.CHAT.PRIVATE,
  ROUTES.CHAT.GROUP,
  ROUTES.CHAT.PROFESSIONAL,
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.ADMIN.USERS,
  ROUTES.ADMIN.SETTINGS,
  ROUTES.ADMIN.REPORTS,
  ROUTES.SETTINGS.PROFILE,
  ROUTES.SETTINGS.NOTIFICATIONS,
  ROUTES.SETTINGS.LANGUAGE,
  ROUTES.SETTINGS.THEME,
  ROUTES.EDUCATIONAL.LIST,
  ROUTES.EDUCATIONAL.TOPIC,
];
EOL

# Configurer les constantes de permissions
echo -e "${YELLOW}Configuration des constantes de permissions...${NC}"
cat > src/constants/permissions.ts << 'EOL'
export const PERMISSIONS = {
  YOUTH: {
    CHAT: {
      SEND_MESSAGES: true,
      SEND_ATTACHMENTS: true,
      SEND_REACTIONS: true,
      DELETE_MESSAGES: true,
      EDIT_MESSAGES: true,
    },
    EDUCATIONAL: {
      VIEW_CONTENT: true,
      DOWNLOAD_CONTENT: false,
    },
    SETTINGS: {
      EDIT_PROFILE: true,
      CHANGE_LANGUAGE: true,
      CHANGE_THEME: true,
    },
  },
  PROFESSIONAL: {
    CHAT: {
      SEND_MESSAGES: true,
      SEND_ATTACHMENTS: true,
      SEND_REACTIONS: true,
      DELETE_MESSAGES: true,
      EDIT_MESSAGES: true,
      CREATE_GROUPS: true,
      MANAGE_GROUPS: true,
    },
    EDUCATIONAL: {
      VIEW_CONTENT: true,
      DOWNLOAD_CONTENT: true,
      UPLOAD_CONTENT: false,
    },
    SETTINGS: {
      EDIT_PROFILE: true,
      CHANGE_LANGUAGE: true,
      CHANGE_THEME: true,
    },
  },
  ADMIN: {
    CHAT: {
      SEND_MESSAGES: true,
      SEND_ATTACHMENTS: true,
      SEND_REACTIONS: true,
      DELETE_MESSAGES: true,
      EDIT_MESSAGES: true,
      CREATE_GROUPS: true,
      MANAGE_GROUPS: true,
      DELETE_GROUPS: true,
    },
    EDUCATIONAL: {
      VIEW_CONTENT: true,
      DOWNLOAD_CONTENT: true,
      UPLOAD_CONTENT: true,
      DELETE_CONTENT: true,
      EDIT_CONTENT: true,
    },
    SETTINGS: {
      EDIT_PROFILE: true,
      CHANGE_LANGUAGE: true,
      CHANGE_THEME: true,
      MANAGE_USERS: true,
      MANAGE_SETTINGS: true,
    },
  },
};
EOL

echo -e "${GREEN}✓ Constantes configurées avec succès${NC}" 