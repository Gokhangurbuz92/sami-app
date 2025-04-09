#!/bin/bash

echo "🔍 Correction spécifique pour android/app/build.gradle..."

APP_GRADLE="android/app/build.gradle"

if [ ! -f "$APP_GRADLE" ]; then
  echo "❌ Fichier $APP_GRADLE introuvable."
  exit 1
fi

# 1. Vérifier et restaurer la référence au projet local
if grep -q "com.capacitorjs:android-capacitor:7.2.0" "$APP_GRADLE"; then
  echo "🔄 Restauration de la référence au projet local capacitor-android"
  sed -i '' 's/implementation "com.capacitorjs:android-capacitor:7.2.0"/implementation project('\'':capacitor-android'\'')/' "$APP_GRADLE"
  echo "✅ Référence restaurée dans $APP_GRADLE"
fi

# 2. Faire de même pour tous les plugins capacitor
for PLUGIN_DIR in node_modules/@capacitor/*/android/build.gradle; do
  if grep -q "com.capacitorjs:android-capacitor:7.2.0" "$PLUGIN_DIR"; then
    echo "🔄 Restauration de la référence au projet local dans $PLUGIN_DIR"
    sed -i '' 's/implementation "com.capacitorjs:android-capacitor:7.2.0"/implementation project('\'':capacitor-android'\'')/' "$PLUGIN_DIR"
    
    # Créer un patch pour ce plugin
    PLUGIN_NAME=$(echo "$PLUGIN_DIR" | sed -E 's/node_modules\/@capacitor\/([^\/]+)\/android\/build.gradle/\1/')
    npx patch-package "@capacitor/$PLUGIN_NAME"
    echo "✅ Patch créé pour @capacitor/$PLUGIN_NAME"
  fi
done

# 3. S'assurer que capacitor.settings.gradle est correct
CAP_SETTINGS="android/capacitor.settings.gradle"
if [ -f "$CAP_SETTINGS" ]; then
  echo "🔍 Vérification de $CAP_SETTINGS"
  CAP_ANDROID_PATH=$(find node_modules/@capacitor/android -type d -name capacitor -print | head -n 1)
  
  if [ -n "$CAP_ANDROID_PATH" ]; then
    RELATIVE_PATH=$(realpath --relative-to="$(pwd)/android" "$(pwd)/$CAP_ANDROID_PATH")
    echo "🔄 Mise à jour du chemin vers capacitor-android: $RELATIVE_PATH"
    sed -i '' "s|projectDir = new File.*capacitor.*)|projectDir = new File('$RELATIVE_PATH')|" "$CAP_SETTINGS"
    echo "✅ Chemin mis à jour dans $CAP_SETTINGS"
  fi
fi

echo "✅ Correction terminée. Exécutez maintenant:"
echo "   cd android && ./gradlew clean :app:assembleDebug" 