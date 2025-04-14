#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de déploiement ===${NC}"

# Configurer le script de déploiement web
echo -e "${YELLOW}Configuration du script de déploiement web...${NC}"
cat > deploy-web.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Déploiement web ===${NC}"

# Vérifier les variables d'environnement
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_AUTH_DOMAIN" ] || [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_STORAGE_BUCKET" ] || [ -z "$FIREBASE_MESSAGING_SENDER_ID" ] || [ -z "$FIREBASE_APP_ID" ] || [ -z "$FIREBASE_MEASUREMENT_ID" ]; then
    echo -e "${RED}❌ Variables d'environnement Firebase manquantes${NC}"
    exit 1
fi

if [ -z "$SENTRY_DSN" ]; then
    echo -e "${RED}❌ Variable d'environnement Sentry manquante${NC}"
    exit 1
fi

# Installer les dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install

# Construire l'application
echo -e "${YELLOW}Construction de l'application...${NC}"
npm run build

# Déployer sur Firebase
echo -e "${YELLOW}Déploiement sur Firebase...${NC}"
firebase deploy --only hosting

echo -e "${GREEN}✓ Déploiement web terminé${NC}"
EOL

# Configurer le script de déploiement Android
echo -e "${YELLOW}Configuration du script de déploiement Android...${NC}"
cat > deploy-android.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Déploiement Android ===${NC}"

# Vérifier les variables d'environnement
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_AUTH_DOMAIN" ] || [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_STORAGE_BUCKET" ] || [ -z "$FIREBASE_MESSAGING_SENDER_ID" ] || [ -z "$FIREBASE_APP_ID" ] || [ -z "$FIREBASE_MEASUREMENT_ID" ]; then
    echo -e "${RED}❌ Variables d'environnement Firebase manquantes${NC}"
    exit 1
fi

if [ -z "$SENTRY_DSN" ]; then
    echo -e "${RED}❌ Variable d'environnement Sentry manquante${NC}"
    exit 1
fi

# Installer les dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install

# Construire l'application
echo -e "${YELLOW}Construction de l'application...${NC}"
npm run build

# Synchroniser avec Capacitor
echo -e "${YELLOW}Synchronisation avec Capacitor...${NC}"
npx cap sync android

# Ouvrir Android Studio
echo -e "${YELLOW}Ouverture d'Android Studio...${NC}"
npx cap open android

echo -e "${GREEN}✓ Déploiement Android terminé${NC}"
echo -e "${YELLOW}⚠️ Veuillez construire et signer l'APK dans Android Studio${NC}"
EOL

# Configurer le script de déploiement iOS
echo -e "${YELLOW}Configuration du script de déploiement iOS...${NC}"
cat > deploy-ios.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Déploiement iOS ===${NC}"

# Vérifier les variables d'environnement
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_AUTH_DOMAIN" ] || [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_STORAGE_BUCKET" ] || [ -z "$FIREBASE_MESSAGING_SENDER_ID" ] || [ -z "$FIREBASE_APP_ID" ] || [ -z "$FIREBASE_MEASUREMENT_ID" ]; then
    echo -e "${RED}❌ Variables d'environnement Firebase manquantes${NC}"
    exit 1
fi

if [ -z "$SENTRY_DSN" ]; then
    echo -e "${RED}❌ Variable d'environnement Sentry manquante${NC}"
    exit 1
fi

# Installer les dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install

# Construire l'application
echo -e "${YELLOW}Construction de l'application...${NC}"
npm run build

# Synchroniser avec Capacitor
echo -e "${YELLOW}Synchronisation avec Capacitor...${NC}"
npx cap sync ios

# Ouvrir Xcode
echo -e "${YELLOW}Ouverture de Xcode...${NC}"
npx cap open ios

echo -e "${GREEN}✓ Déploiement iOS terminé${NC}"
echo -e "${YELLOW}⚠️ Veuillez construire et signer l'application dans Xcode${NC}"
EOL

# Rendre les scripts exécutables
chmod +x deploy-web.sh deploy-android.sh deploy-ios.sh

echo -e "${GREEN}✓ Scripts de déploiement configurés avec succès${NC}" 