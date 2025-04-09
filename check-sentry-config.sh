#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification de la configuration Sentry ===${NC}"

# Vérification des fichiers de configuration
CONFIG_FILES=(
    "sentry.tsx"
    "sentryCapacitor.ts"
    "android/app/src/main/assets/capacitor.config.json"
    "ios/App/App/capacitor.config.json"
)

for FILE in "${CONFIG_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}$FILE trouvé${NC}"
        
        # Vérification de la présence du DSN
        if grep -q "a1f0f2001361095c45e2cc24d5d38fc7" "$FILE"; then
            echo -e "${GREEN}DSN Sentry trouvé dans $FILE${NC}"
        else
            echo -e "${RED}DSN Sentry manquant dans $FILE${NC}"
        fi
    else
        echo -e "${RED}$FILE non trouvé${NC}"
    fi
done

# Vérification des versions Sentry
echo -e "${YELLOW}Vérification des versions Sentry...${NC}"
SENTRY_PACKAGES=(
    "@sentry/react"
    "@sentry/capacitor"
)

for PACKAGE in "${SENTRY_PACKAGES[@]}"; do
    VERSION=$(npm list $PACKAGE | grep $PACKAGE | awk -F@ '{print $2}')
    if [ -n "$VERSION" ]; then
        echo -e "${GREEN}$PACKAGE: $VERSION${NC}"
    else
        echo -e "${RED}$PACKAGE non installé${NC}"
    fi
done

# Vérification de la configuration sourcemaps
if [ -f "sentry.properties" ]; then
    echo -e "${GREEN}Fichier sentry.properties trouvé${NC}"
    if grep -q "defaults.url=https://sentry.io/" "sentry.properties"; then
        echo -e "${GREEN}Configuration sourcemaps correcte${NC}"
    else
        echo -e "${RED}Configuration sourcemaps incorrecte${NC}"
    fi
else
    echo -e "${RED}Fichier sentry.properties non trouvé${NC}"
fi

echo -e "${GREEN}=== Vérification Sentry terminée ===${NC}" 