#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Compilation de l'application Android...${NC}"

# Vérification de Java
echo -e "${YELLOW}Vérification de Java...${NC}"
if [ -z "$JAVA_HOME" ]; then
    echo -e "${RED}❌ JAVA_HOME n'est pas défini${NC}"
    exit 1
fi

if [ ! -d "$JAVA_HOME" ]; then
    echo -e "${RED}❌ Le répertoire JAVA_HOME n'existe pas: $JAVA_HOME${NC}"
    exit 1
fi

# Vérification de la version Java
JAVA_VERSION=$($JAVA_HOME/bin/java -version 2>&1 | head -n 1 | cut -d'"' -f2)
if [[ ! $JAVA_VERSION =~ ^17.* ]]; then
    echo -e "${RED}❌ Version Java incorrecte: $JAVA_VERSION. Java 17 requis.${NC}"
    exit 1
fi

# Nettoyage complet
echo -e "${YELLOW}Nettoyage complet...${NC}"
cd sami-app-new
rm -rf node_modules/.cache
rm -rf android/.gradle
rm -rf android/app/build
rm -rf dist
rm -rf ios/App/App/build

# Installation des dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm ci

# Construction du projet
echo -e "${YELLOW}Construction du projet...${NC}"
SKIP_TYPE_CHECK=true npm run build

# Synchronisation avec Capacitor
echo -e "${YELLOW}Synchronisation avec Capacitor...${NC}"
npx cap sync android

# Compilation Android
echo -e "${YELLOW}Compilation Android...${NC}"
cd android
./gradlew clean
./gradlew bundleRelease --stacktrace --info

# Vérification du résultat
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilation réussie !${NC}"
    echo "Le fichier .aab se trouve dans app/build/outputs/bundle/release/app-release.aab"
else
    echo -e "${RED}❌ Erreur lors de la compilation${NC}"
    exit 1
fi 