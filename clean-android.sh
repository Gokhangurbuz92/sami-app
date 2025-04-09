#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Début du nettoyage Android ===${NC}"

# 1. Sauvegarde des configurations importantes
echo -e "${YELLOW}Sauvegarde des configurations...${NC}"
mkdir -p backup/android
cp android/app/build.gradle backup/android/
cp android/build.gradle backup/android/
cp android/gradle.properties backup/android/
cp android/settings.gradle backup/android/
cp android/app/google-services.json backup/android/ 2>/dev/null || true

# 2. Nettoyage des fichiers temporaires
echo -e "${YELLOW}Nettoyage des fichiers temporaires...${NC}"
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle
rm -rf android/.idea
rm -rf android/app/.cxx
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# 3. Reconstruction propre
echo -e "${YELLOW}Reconstruction du projet...${NC}"

# Installation des dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install

# Configuration de Java 17
echo -e "${YELLOW}Configuration de Java 17...${NC}"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

# Reconstruction Android
echo -e "${YELLOW}Reconstruction Android...${NC}"
cd android
./gradlew clean
cd ..

# Synchronisation Capacitor
echo -e "${YELLOW}Synchronisation Capacitor...${NC}"
npx cap sync android

# Build Android
echo -e "${YELLOW}Build Android...${NC}"
cd android
./gradlew assembleDebug

echo -e "${GREEN}=== Nettoyage terminé avec succès ===${NC}"
echo -e "${YELLOW}Les fichiers de sauvegarde sont disponibles dans le dossier backup/android${NC}" 