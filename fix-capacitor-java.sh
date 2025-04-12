#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Correction des configurations Java des plugins Capacitor ===${NC}"

# Mise à jour des fichiers build.gradle des plugins
echo -e "${YELLOW}Mise à jour des configurations des plugins...${NC}"

# Mise à jour du plugin Capacitor Android
sed -i '' 's/sourceCompatibility = .*/sourceCompatibility = JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
sed -i '' 's/targetCompatibility = .*/targetCompatibility = JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle

# Mise à jour du plugin Sentry Capacitor
sed -i '' 's/sourceCompatibility = .*/sourceCompatibility = JavaVersion.VERSION_17/g' node_modules/@sentry/capacitor/android/build.gradle
sed -i '' 's/targetCompatibility = .*/targetCompatibility = JavaVersion.VERSION_17/g' node_modules/@sentry/capacitor/android/build.gradle

# Mise à jour des plugins Cordova
find node_modules/@capacitor/cordova-android-plugins -name "build.gradle" -type f -exec sed -i '' 's/sourceCompatibility = .*/sourceCompatibility = JavaVersion.VERSION_17/g' {} \;
find node_modules/@capacitor/cordova-android-plugins -name "build.gradle" -type f -exec sed -i '' 's/targetCompatibility = .*/targetCompatibility = JavaVersion.VERSION_17/g' {} \;

# Nettoyage et reconstruction
echo -e "${YELLOW}Nettoyage et reconstruction...${NC}"
cd android
./gradlew clean
./gradlew assembleDebug

echo -e "${GREEN}=== Correction des configurations Java des plugins Capacitor terminée ===${NC}" 