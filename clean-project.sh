#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Nettoyage du projet ===${NC}"

# Supprimer les dossiers de build
echo -e "${YELLOW}Suppression des dossiers de build...${NC}"
rm -rf node_modules
rm -rf dist
rm -rf android/app/build
rm -rf ios/build

# Supprimer les fichiers .DS_Store
echo -e "${YELLOW}Suppression des fichiers .DS_Store...${NC}"
find . -name ".DS_Store" -delete

# Supprimer les fichiers .log
echo -e "${YELLOW}Suppression des fichiers .log...${NC}"
find . -name "*.log" -delete

echo -e "${GREEN}✓ Nettoyage terminé${NC}" 