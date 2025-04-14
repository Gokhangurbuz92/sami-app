#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Vérification de l'environnement..."

# Vérifier si keytool est installé
if ! command -v keytool &> /dev/null; then
    echo -e "${RED}❌ keytool n'est pas installé. Veuillez installer le JDK.${NC}"
    exit 1
fi

# Vérifier si le keystore existe
if [ ! -f "sami-app-new/android/app/sami-app.keystore" ]; then
    echo -e "${RED}❌ Le keystore n'existe pas. Veuillez le créer manuellement.${NC}"
    exit 1
fi

# Créer le fichier signing.properties
cat > sami-app-new/android/signing.properties << EOL
RELEASE_STORE_FILE=../app/sami-app.keystore
RELEASE_KEY_ALIAS=sami-app-key
RELEASE_STORE_PASSWORD=sami-app
RELEASE_KEY_PASSWORD=sami-app
EOL

# Ajouter les fichiers sensibles au .gitignore
if ! grep -q "*.keystore" sami-app-new/.gitignore; then
    echo -e "\n# Fichiers de signature Android" >> sami-app-new/.gitignore
    echo "*.keystore" >> sami-app-new/.gitignore
    echo "signing.properties" >> sami-app-new/.gitignore
fi

# Construire le projet
echo "Construction du projet..."
cd sami-app-new
npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# Vérifier si la compilation a réussi
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ .aab généré avec succès !${NC}"
    echo -e "${YELLOW}📝 Documentation :${NC}"
    echo -e "Le fichier .aab se trouve dans : sami-app-new/android/app/build/outputs/bundle/release/"
    echo -e "Le keystore se trouve dans : sami-app-new/android/app/sami-app.keystore"
    echo -e "\n${YELLOW}⚠️ Important :${NC}"
    echo -e "1. Conservez le keystore en lieu sûr"
    echo -e "2. Ne partagez jamais le keystore ou les mots de passe"
    echo -e "3. Utilisez les mêmes informations pour les mises à jour futures"
else
    echo -e "${RED}❌ Erreur lors de la génération du .aab${NC}"
    exit 1
fi 