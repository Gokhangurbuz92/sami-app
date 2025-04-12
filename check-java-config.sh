#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification de la configuration Java ===${NC}"

# Vérifier si Java est installé
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java n'est pas installé${NC}"
    exit 1
fi

# Vérifier la version de Java
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
echo -e "Version Java détectée: ${GREEN}$JAVA_VERSION${NC}"

# Vérifier si JAVA_HOME est configuré
if [ -z "$JAVA_HOME" ]; then
    echo -e "${RED}❌ JAVA_HOME n'est pas configuré${NC}"
else
    echo -e "${GREEN}✓ JAVA_HOME est configuré: $JAVA_HOME${NC}"
fi

# Vérifier le fichier gradle.properties
if [ -f "android/gradle.properties" ]; then
    echo -e "${GREEN}✓ Le fichier gradle.properties existe${NC}"
    # Vérifier la configuration Java dans gradle.properties
    if grep -q "org.gradle.java.home" android/gradle.properties; then
        echo -e "${GREEN}✓ La configuration Java est présente dans gradle.properties${NC}"
    else
        echo -e "${YELLOW}⚠ La configuration Java n'est pas présente dans gradle.properties${NC}"
    fi
else
    echo -e "${RED}❌ Le fichier gradle.properties n'existe pas${NC}"
fi

# Vérifier les permissions des dossiers Gradle
GRADLE_DIRS=("$HOME/.gradle" "android/.gradle")
for dir in "${GRADLE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        if [ -w "$dir" ]; then
            echo -e "${GREEN}✓ Le dossier $dir a les bonnes permissions${NC}"
        else
            echo -e "${RED}❌ Le dossier $dir n'a pas les bonnes permissions${NC}"
        fi
    fi
done

echo -e "\n${YELLOW}=== Fin de la vérification ===${NC}" 