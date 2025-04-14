#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Initialisation du projet SAMI ===${NC}"

# Créer un nouveau projet React avec TypeScript
echo -e "${YELLOW}Création du projet React...${NC}"
npm create vite@latest sami-app -- --template react-ts

# Se déplacer dans le répertoire du projet
cd sami-app

# Installer les dépendances de base
echo -e "${YELLOW}Installation des dépendances de base...${NC}"
npm install

# Installer les dépendances Firebase
echo -e "${YELLOW}Installation des dépendances Firebase...${NC}"
npm install firebase @firebase/auth @firebase/firestore @firebase/storage @firebase/messaging

# Installer Capacitor
echo -e "${YELLOW}Installation de Capacitor...${NC}"
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init sami-app com.gokhangurbuz.samiapp --web-dir=dist

# Installer les dépendances UI
echo -e "${YELLOW}Installation des dépendances UI...${NC}"
npm install @ionic/react @ionic/core @emotion/react @emotion/styled @mui/material @mui/icons-material

# Installer les dépendances de développement
echo -e "${YELLOW}Installation des dépendances de développement...${NC}"
npm install -D typescript @types/react @types/react-dom @types/node eslint prettier @sentry/webpack-plugin

# Copier les fichiers de configuration
echo -e "${YELLOW}Copie des fichiers de configuration...${NC}"
cp ../.env .env
cp ../.env.example .env.example
cp ../.env.local .env.local
cp ../.env.production .env.production
cp ../.env.sentry-build-plugin .env.sentry-build-plugin
cp ../.eslintrc.json .eslintrc.json
cp ../.prettierrc .prettierrc
cp ../tsconfig.json tsconfig.json
cp ../tsconfig.node.json tsconfig.node.json
cp ../vite.config.ts vite.config.ts

# Copier les fichiers Firebase
echo -e "${YELLOW}Copie des fichiers Firebase...${NC}"
cp ../.firebase .firebase
cp ../.firebaserc .firebaserc
cp ../firebase.json firebase.json
cp ../firestore.indexes.json firestore.indexes.json
cp ../firestore.rules firestore.rules

# Copier les fichiers Capacitor
echo -e "${YELLOW}Copie des fichiers Capacitor...${NC}"
cp ../capacitor.config.ts capacitor.config.ts

# Copier les fichiers Sentry
echo -e "${YELLOW}Copie des fichiers Sentry...${NC}"
cp ../sentry.properties sentry.properties

# Initialiser Git
echo -e "${YELLOW}Initialisation de Git...${NC}"
git init
git add .
git commit -m "Initial commit"

echo -e "${GREEN}✓ Projet initialisé avec succès${NC}" 