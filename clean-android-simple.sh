#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Début du nettoyage Android ===${NC}"

# Nettoyage des dossiers temporaires
echo -e "${YELLOW}Nettoyage des dossiers temporaires...${NC}"
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle
rm -rf node_modules
rm -rf dist

# Installation des dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install

# Configuration de Java 17
echo -e "${YELLOW}Configuration de Java 17...${NC}"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "JAVA_HOME=$JAVA_HOME"

# Build du projet web
echo -e "${YELLOW}Build du projet web...${NC}"
npm run build

# Synchronisation Capacitor
echo -e "${YELLOW}Synchronisation Capacitor...${NC}"
npx cap sync android
npx cap sync ios

# Build Android
echo -e "${YELLOW}Build Android...${NC}"
cd android
./gradlew clean
./gradlew assembleDebug

echo -e "${GREEN}Nettoyage terminé avec succès!${NC}" 