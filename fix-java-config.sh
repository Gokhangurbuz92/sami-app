#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Correction de la configuration Java ===${NC}"

# Trouver le bon chemin Java 17
JAVA_17_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)

if [ -z "$JAVA_17_HOME" ]; then
    echo -e "${RED}❌ Java 17 n'est pas installé${NC}"
    echo -e "${YELLOW}Installation de Java 17 via Homebrew...${NC}"
    brew install --cask temurin17
    JAVA_17_HOME=$(/usr/libexec/java_home -v 17)
fi

if [ -d "$JAVA_17_HOME" ]; then
    echo -e "${GREEN}✓ Java 17 trouvé: $JAVA_17_HOME${NC}"
    
    # Configurer JAVA_HOME
    echo "export JAVA_HOME=$JAVA_17_HOME" >> ~/.zshrc
    export JAVA_HOME=$JAVA_17_HOME
    
    # Mettre à jour gradle.properties
    if [ -f "android/gradle.properties" ]; then
        echo -e "${YELLOW}Mise à jour du fichier gradle.properties...${NC}"
        echo "org.gradle.java.home=$JAVA_17_HOME" >> android/gradle.properties
        echo -e "${GREEN}✓ Configuration Java mise à jour dans gradle.properties${NC}"
    else
        echo -e "${RED}❌ Le fichier gradle.properties n'existe pas${NC}"
    fi
else
    echo -e "${RED}❌ Impossible de trouver Java 17${NC}"
    exit 1
fi

echo -e "${YELLOW}=== Fin de la correction ===${NC}"

echo -e "\n${GREEN}Pour appliquer les changements, veuillez redémarrer votre terminal ou exécuter:${NC}"
echo -e "source ~/.zshrc" 