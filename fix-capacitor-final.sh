#!/bin/bash

echo "🔄 Solution de contournement finale pour capacitor-android..."

# Étape 1: Créer des répertoires libs si nécessaire
mkdir -p android/app/libs

# Étape 2: Copier le JAR de capacitor-android s'il existe
if [ -f "node_modules/@capacitor/android/capacitor/build/outputs/aar/capacitor-android-debug.aar" ]; then
  cp node_modules/@capacitor/android/capacitor/build/outputs/aar/capacitor-android-debug.aar android/app/libs/capacitor-android.aar
  echo "✅ AAR de capacitor-android copié dans android/app/libs"
else
  echo "⚠️ Le AAR de capacitor-android n'a pas été trouvé, création d'un stub..."
  touch android/app/libs/capacitor-android.jar
fi

# Étape 3: Modifier les build.gradle des plugins pour qu'ils utilisent androidx à la place
for PLUGIN_DIR in node_modules/@capacitor/*/android/build.gradle; do
  echo "🔄 Modification de $PLUGIN_DIR"
  
  # Modifier la dépendance à capacitor-android
  sed -i '' 's|implementation project('\'':capacitor-android'\'')|// implementation project('\'':capacitor-android'\'')
        implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"|g' "$PLUGIN_DIR"
done

# Étape 4: Supprimer les références au projet capacitor-android dans android/settings.gradle
if grep -q "include ':capacitor-android'" "android/settings.gradle"; then
  echo "🔄 Mise à jour de android/settings.gradle"
  sed -i '' '/include '\'':capacitor-android'\''/d' "android/settings.gradle"
  sed -i '' '/project('\'':capacitor-android'\'').projectDir/d' "android/settings.gradle"
fi

# Étape 5: Mettre à jour android/app/build.gradle pour utiliser le AAR local
APP_GRADLE="android/app/build.gradle"
if grep -q "implementation project(':capacitor-android')" "$APP_GRADLE"; then
  echo "🔄 Mise à jour de android/app/build.gradle"
  sed -i '' 's|implementation project('\'':capacitor-android'\'')|implementation fileTree(include: ['\''\*.jar'\'', '\''\*.aar'\''], dir: '\''libs'\'')|' "$APP_GRADLE"
fi

echo "✅ Configurations mises à jour avec succès."
echo "Essayez maintenant: cd android && ./gradlew :app:assembleDebug" 