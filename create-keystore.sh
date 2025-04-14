#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Création du keystore pour SAMI App...${NC}"

# Créer le répertoire si nécessaire
mkdir -p sami-app-new/android/app

# Générer le keystore avec des valeurs prédéfinies
keytool -genkey -v \
    -keystore sami-app-new/android/app/sami-app.keystore \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias sami-app-key \
    -storepass sami-app \
    -keypass sami-app \
    -dname "CN=SAMI App, OU=Development, O=SAMI, L=Strasbourg, ST=Grand Est, C=FR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Keystore généré avec succès !${NC}"
    echo -e "\nInformations du keystore :"
    echo -e "Chemin : sami-app-new/android/app/sami-app.keystore"
    echo -e "Alias : sami-app-key"
    echo -e "Mot de passe du keystore : sami-app"
    echo -e "Mot de passe de la clé : sami-app"
else
    echo -e "${RED}❌ Erreur lors de la génération du keystore${NC}"
    exit 1
fi 