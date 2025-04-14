#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Correction du build.gradle...${NC}"

# Sauvegarde du fichier original
cp sami-app-new/android/app/build.gradle sami-app-new/android/app/build.gradle.bak

# Restauration du fichier original depuis la sauvegarde
cp backup/android/app/build.gradle sami-app-new/android/app/build.gradle

# Ajout de la configuration de signature
cat >> sami-app-new/android/app/build.gradle << 'EOL'

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

echo -e "${GREEN}✅ Le fichier build.gradle a été mis à jour avec succès !${NC}" 