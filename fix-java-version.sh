#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Correction des versions Java ===${NC}"

# Mise à jour de JAVA_HOME
echo -e "${YELLOW}Mise à jour de JAVA_HOME...${NC}"
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
echo "JAVA_HOME=$JAVA_HOME" >> ~/.zshrc

# Mise à jour des fichiers de configuration
echo -e "${YELLOW}Mise à jour des fichiers de configuration...${NC}"

# Mise à jour de gradle.properties
sed -i '' 's/org.gradle.java.home=.*/org.gradle.java.home=\/Library\/Java\/JavaVirtualMachines\/temurin-17.jdk\/Contents\/Home/g' gradle.properties

# Mise à jour des fichiers build.gradle
find . -name "build.gradle" -type f -exec sed -i '' 's/sourceCompatibility = .*/sourceCompatibility = JavaVersion.VERSION_17/g' {} \;
find . -name "build.gradle" -type f -exec sed -i '' 's/targetCompatibility = .*/targetCompatibility = JavaVersion.VERSION_17/g' {} \;

# Mise à jour des fichiers Capacitor
find . -name "capacitor.config.json" -type f -exec sed -i '' 's/"javaVersion":.*/"javaVersion": "17"/g' {} \;

# Nettoyage et reconstruction
echo -e "${YELLOW}Nettoyage et reconstruction...${NC}"
./gradlew clean
./gradlew assembleDebug

echo -e "${GREEN}=== Correction des versions Java terminée ===${NC}" 