#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Mise à jour des plugins Capacitor et Sentry...${NC}"

# Mise à jour des packages
npm install @capacitor/android@5.0.6 @capacitor/core@5.0.6 @capacitor/ios@5.0.6 @sentry/capacitor@0.12.0

# Synchronisation avec Capacitor
npx cap sync android

# Nettoyage et reconstruction
cd android
./gradlew clean
./gradlew assembleDebug

echo -e "${GREEN}Mise à jour terminée avec succès !${NC}" 