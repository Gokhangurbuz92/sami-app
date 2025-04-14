#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Compilation de l'application Android...${NC}"

# Construction du projet
echo "Construction du projet..."
cd sami-app-new
SKIP_TYPE_CHECK=true npm run build

# Synchronisation avec Capacitor
echo "Synchronisation avec Capacitor..."
npx cap sync android

# Compilation Android
echo "Compilation Android..."
cd android
./gradlew bundleRelease

# Vérification du résultat
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilation réussie !${NC}"
    echo "Le fichier .aab se trouve dans app/build/outputs/bundle/release/app-release.aab"
else
    echo -e "${RED}❌ Erreur lors de la compilation${NC}"
    exit 1
fi 