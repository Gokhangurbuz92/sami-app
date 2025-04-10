#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des plugins Capacitor ===${NC}"

# Liste des plugins à vérifier
PLUGINS=(
    "@capacitor/android"
    "@capacitor/core"
    "@capacitor/ios"
    "@capacitor/app"
    "@capacitor/haptics"
    "@capacitor/keyboard"
    "@capacitor/status-bar"
    "@capacitor/storage"
    "@capacitor/splash-screen"
    "@sentry/capacitor"
)

# Vérification et correction des versions
for PLUGIN in "${PLUGINS[@]}"; do
    echo -e "${YELLOW}Vérification de $PLUGIN...${NC}"
    
    # Récupération de la version actuelle
    CURRENT_VERSION=$(npm list $PLUGIN | grep $PLUGIN | awk -F@ '{print $2}')
    
    if [ -z "$CURRENT_VERSION" ]; then
        echo -e "${RED}$PLUGIN n'est pas installé${NC}"
        npm install $PLUGIN@latest
    else
        echo -e "${GREEN}Version actuelle: $CURRENT_VERSION${NC}"
        
        # Vérification des mises à jour disponibles
        LATEST_VERSION=$(npm view $PLUGIN version)
        
        if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
            echo -e "${YELLOW}Mise à jour disponible: $LATEST_VERSION${NC}"
            npm install $PLUGIN@$LATEST_VERSION
        else
            echo -e "${GREEN}Version à jour${NC}"
        fi
    fi
done

# Synchronisation Capacitor
echo -e "${YELLOW}Synchronisation Capacitor...${NC}"
npx cap sync

echo -e "${GREEN}=== Vérification des plugins terminée ===${NC}" 