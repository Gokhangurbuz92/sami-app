#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Démarrage de l'installation de SAMI...${NC}"

# Vérifier les prérequis
echo "Vérification des prérequis..."
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js n'est pas installé${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm n'est pas installé${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}git n'est pas installé${NC}"; exit 1; }

# Installer les dépendances
echo "Installation des dépendances..."
npm install

# Configurer Firebase
echo "Configuration de Firebase..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}Veuillez configurer vos variables d'environnement dans .env${NC}"
fi

# Configurer Capacitor
echo "Configuration de Capacitor..."
npx cap sync

# Configurer Android
echo "Configuration d'Android..."
cd android
./gradlew clean
cd ..

# Configurer iOS
echo "Configuration d'iOS..."
cd ios
pod install
cd ..

# Configurer Sentry
echo "Configuration de Sentry..."
if [ ! -f "sentry.properties" ]; then
    echo -e "${RED}Veuillez configurer sentry.properties${NC}"
fi

# Vérifier la configuration
echo "Vérification de la configuration..."
npm run lint
npm run type-check

echo -e "${GREEN}Installation terminée !${NC}"
echo "Pour démarrer le projet en mode développement :"
echo "npm run dev"
echo "Pour construire le projet :"
echo "npm run build" 