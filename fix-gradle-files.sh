#!/bin/bash

# Mettre à jour la version Java dans capacitor-android/build.gradle
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle

# Mettre à jour la version Gradle dans android/gradle.properties
echo "# Suprimer les avertissements de compileSdk 35" >> android/gradle.properties
echo "android.suppressUnsupportedCompileSdk=35" >> android/gradle.properties

echo "✅ Fichiers Gradle corrigés avec succès!"
