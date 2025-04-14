#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration de la structure des dossiers ===${NC}"

# Créer les dossiers principaux
mkdir -p src/{components,pages,services,hooks,utils,assets,styles,types,constants,contexts}

# Créer les sous-dossiers des composants
mkdir -p src/components/{common,chat,auth,admin,settings,notifications}

# Créer les sous-dossiers des pages
mkdir -p src/pages/{auth,chat,admin,settings,profile}

# Créer les sous-dossiers des services
mkdir -p src/services/{firebase,sentry,translation,notifications}

# Créer les sous-dossiers des assets
mkdir -p src/assets/{images,icons,fonts,videos}

# Créer les fichiers de base
touch src/types/index.ts
touch src/constants/index.ts
touch src/contexts/index.ts
touch src/hooks/index.ts
touch src/utils/index.ts
touch src/styles/global.css

# Créer les fichiers de configuration
touch src/services/firebase/config.ts
touch src/services/sentry/config.ts
touch src/services/translation/config.ts
touch src/services/notifications/config.ts

# Créer les fichiers de contexte
touch src/contexts/AuthContext.tsx
touch src/contexts/ChatContext.tsx
touch src/contexts/ThemeContext.tsx
touch src/contexts/LanguageContext.tsx

# Créer les fichiers de types
touch src/types/auth.ts
touch src/types/chat.ts
touch src/types/user.ts
touch src/types/message.ts
touch src/types/notification.ts

# Créer les fichiers de constantes
touch src/constants/theme.ts
touch src/constants/languages.ts
touch src/constants/routes.ts
touch src/constants/permissions.ts

echo -e "${GREEN}✓ Structure des dossiers configurée avec succès${NC}" 