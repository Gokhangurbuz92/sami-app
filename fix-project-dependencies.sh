#!/bin/bash

echo "🔍 Correction des références de projets Capacitor..."

# Étape 1: Vérifier si tous les modules nécessaires sont présents
if [ ! -d "node_modules/@capacitor" ]; then
  echo "❌ Modules Capacitor non trouvés. Exécutez d'abord 'npm install'."
  exit 1
fi

# Étape 2: Corriger capacitor.settings.gradle si nécessaire
if [ -f "android/capacitor.settings.gradle" ] && [ -d "node_modules/@capacitor/android/capacitor" ]; then
  echo "✅ Vérification de capacitor.settings.gradle"
  
  # Assurez-vous que le chemin vers capacitor-android est correct
  if ! grep -q "projectDir = new File('../node_modules/@capacitor/android/capacitor')" "android/capacitor.settings.gradle"; then
    echo "🔄 Mise à jour du chemin vers capacitor-android"
    sed -i '' 's|projectDir = new File(.*)$|projectDir = new File('\''../node_modules/@capacitor/android/capacitor'\'')|' "android/capacitor.settings.gradle"
  fi
fi

# Étape 3: Supprimer le problème android.suppressUnsupportedCompileSdk
if [ -f "android/gradle.properties" ]; then
  echo "✅ Ajout de android.suppressUnsupportedCompileSdk=35 dans gradle.properties"
  if ! grep -q "android.suppressUnsupportedCompileSdk=35" "android/gradle.properties"; then
    echo "android.suppressUnsupportedCompileSdk=35" >> "android/gradle.properties"
  fi
fi

# Étape 4: S'assurer que le compileSdk est 34 dans tous les fichiers build.gradle
for GRADLE_FILE in $(find android -name "build.gradle"); do
  if grep -q "compileSdk.*35" "$GRADLE_FILE"; then
    echo "🔄 Correction de compileSdk dans $GRADLE_FILE (35 -> 34)"
    sed -i '' 's/compileSdk.*35/compileSdk 34/' "$GRADLE_FILE"
  fi
  
  if grep -q "targetSdkVersion.*35" "$GRADLE_FILE"; then
    echo "🔄 Correction de targetSdkVersion dans $GRADLE_FILE (35 -> 34)"
    sed -i '' 's/targetSdkVersion.*35/targetSdkVersion 34/' "$GRADLE_FILE"
  fi
done

echo "✅ Corrections appliquées avec succès. Vous pouvez maintenant exécuter:"
echo "   cd android && ./gradlew :app:assembleDebug" 