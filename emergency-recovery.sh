#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  Script de récupération d'urgence pour SAMI ⚠️${NC}"
echo -e "${YELLOW}Ce script va restaurer le projet en cas de perte d'accès à Cursor${NC}"

# Vérifier les prérequis
echo -e "\n${GREEN}Vérification des prérequis...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js n'est pas installé${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm n'est pas installé${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}git n'est pas installé${NC}"; exit 1; }

# Récupérer le code source
echo -e "\n${GREEN}Récupération du code source...${NC}"
if [ -d "sami-app-backup" ]; then
    echo "Utilisation de la sauvegarde locale..."
    cp -r sami-app-backup/* .
    cp -r sami-app-backup/.* . 2>/dev/null || true
else
    echo "Clonage depuis GitHub..."
    git clone https://github.com/your-username/sami-app.git .
fi

# Restaurer les dépendances
echo -e "\n${GREEN}Restauration des dépendances...${NC}"
npm install

# Restaurer les variables d'environnement
echo -e "\n${GREEN}Restauration des variables d'environnement...${NC}"
if [ -f ".env.backup" ]; then
    cp .env.backup .env
else
    echo -e "${YELLOW}Aucune sauvegarde de .env trouvée. Veuillez configurer manuellement.${NC}"
fi

# Restaurer les clés API
echo -e "\n${GREEN}Restauration des clés API...${NC}"
if [ -f "api-keys.backup.json" ]; then
    cp api-keys.backup.json api-keys.json
else
    echo -e "${YELLOW}Aucune sauvegarde des clés API trouvée. Veuillez configurer manuellement.${NC}"
fi

# Vérifier la configuration
echo -e "\n${GREEN}Vérification de la configuration...${NC}"
npm run lint
npm run type-check

# Configurer Capacitor
echo -e "\n${GREEN}Configuration de Capacitor...${NC}"
npx cap sync

# Configurer Android
echo -e "\n${GREEN}Configuration d'Android...${NC}"
cd android
./gradlew clean
cd ..

# Configurer iOS
echo -e "\n${GREEN}Configuration d'iOS...${NC}"
cd ios
pod install
cd ..

echo -e "\n${GREEN}✅ Récupération terminée !${NC}"
echo -e "Pour démarrer le projet en mode développement :"
echo -e "npm run dev"
echo -e "\nPour construire le projet :"
echo -e "npm run build"
echo -e "\n${YELLOW}⚠️  N'oubliez pas de vérifier les variables d'environnement et les clés API !${NC}" 