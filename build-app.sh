#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Compilation de l'application...${NC}"

# Construction du projet
echo "Construction du projet..."
vite build

# Synchronisation avec Capacitor
echo "Synchronisation avec Capacitor..."
npx cap sync android

# Compilation Android
echo "Compilation Android..."
cd android
./gradlew assembleRelease

# Vérification du résultat
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilation réussie !${NC}"
    echo "Le fichier .aab se trouve dans android/app/build/outputs/bundle/release/"
else
    echo -e "${RED}❌ Erreur lors de la compilation${NC}"
    exit 1
fi 