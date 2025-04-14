#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Vérification de l'environnement
echo -e "${GREEN}Vérification de l'environnement...${NC}"
if ! command -v keytool &> /dev/null; then
    echo -e "${RED}❌ keytool n'est pas installé${NC}"
    exit 1
fi

# Création du répertoire pour les clés
echo -e "${GREEN}Création du répertoire pour les clés...${NC}"
mkdir -p sami-app-new/android/keystore

# Génération du keystore
echo -e "${GREEN}Génération du keystore...${NC}"
read -sp "Entrez le mot de passe du keystore: " KEYSTORE_PASSWORD
echo
read -sp "Confirmez le mot de passe du keystore: " KEYSTORE_PASSWORD_CONFIRM
echo

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Les mots de passe ne correspondent pas${NC}"
    exit 1
fi

read -p "Entrez le nom de l'alias: " KEY_ALIAS
read -sp "Entrez le mot de passe de la clé: " KEY_PASSWORD
echo

# Génération du keystore
keytool -genkey -v \
    -keystore sami-app-new/android/keystore/sami-keystore.jks \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=SAMI App, OU=Development, O=SAMI, L=Paris, S=Paris, C=FR"

# Création du fichier signing.properties
echo -e "${GREEN}Création du fichier signing.properties...${NC}"
cat > sami-app-new/android/signing.properties << EOL
RELEASE_STORE_FILE=keystore/sami-keystore.jks
RELEASE_KEY_ALIAS=$KEY_ALIAS
RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD
RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOL

# Mise à jour du build.gradle
echo -e "${GREEN}Mise à jour du build.gradle...${NC}"
cat > sami-app-new/android/app/build.gradle << EOL
def keystorePropertiesFile = rootProject.file("signing.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['RELEASE_STORE_FILE'])
            storePassword keystoreProperties['RELEASE_STORE_PASSWORD']
            keyAlias keystoreProperties['RELEASE_KEY_ALIAS']
            keyPassword keystoreProperties['RELEASE_KEY_PASSWORD']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
EOL

# Mise à jour du .gitignore
echo -e "${GREEN}Mise à jour du .gitignore...${NC}"
if ! grep -q "keystore/" sami-app-new/.gitignore; then
    echo -e "\n# Fichiers de signature Android\nkeystore/\nsigning.properties" >> sami-app-new/.gitignore
fi

# Création d'un fichier .env.example pour la documentation
echo -e "${GREEN}Création du fichier .env.example...${NC}"
cat > sami-app-new/.env.example << EOL
# Configuration de signature Android
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_PASSWORD=your_key_password
ANDROID_KEY_ALIAS=your_key_alias
EOL

echo -e "${GREEN}✅ Configuration de signature terminée !${NC}"
echo -e "${GREEN}📝 Documentation :${NC}"
echo "1. Le keystore a été créé dans : sami-app-new/android/keystore/sami-keystore.jks"
echo "2. Les informations de signature sont dans : sami-app-new/android/signing.properties"
echo "3. Le build.gradle a été mis à jour pour utiliser la signature"
echo "4. Les fichiers sensibles ont été ajoutés à .gitignore"
echo "5. Un fichier .env.example a été créé pour la documentation"

echo -e "\n${GREEN}⚠️ IMPORTANT :${NC}"
echo "1. Sauvegardez le keystore et les mots de passe dans un endroit sécurisé"
echo "2. Ne partagez jamais le keystore ou les mots de passe"
echo "3. Conservez une copie de sauvegarde du keystore" 