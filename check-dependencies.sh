#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des dépendances ===${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Node.js est installé${NC}"
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm est installé${NC}"
fi

# Vérifier Capacitor
if ! command -v npx cap &> /dev/null; then
    echo -e "${RED}❌ Capacitor n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Capacitor est installé${NC}"
fi

# Vérifier Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Java est installé${NC}"
fi

# Vérifier Android Studio
if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo -e "${RED}❌ Android Studio n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Android Studio est installé${NC}"
fi

# Vérifier Xcode
if ! command -v xcode-select &> /dev/null; then
    echo -e "${RED}❌ Xcode n'est pas installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Xcode est installé${NC}"
fi

echo -e "${GREEN}✓ Toutes les dépendances sont installées${NC}" 