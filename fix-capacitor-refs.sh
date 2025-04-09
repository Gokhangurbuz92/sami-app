#!/bin/bash

echo "🔍 Correction des références à capacitor-android..."

# Vérifie si Capacitor a été installé correctement
if [ ! -d "node_modules/@capacitor" ]; then
  echo "❌ Modules Capacitor non trouvés. Exécutez d'abord 'npm install'."
  exit 1
fi

# Ajoute les informations dans settings.gradle si elles n'existent pas déjà
SETTINGS_FILE="android/settings.gradle"
if [ -f "$SETTINGS_FILE" ]; then
  if ! grep -q "mavenCentral()" "$SETTINGS_FILE"; then
    echo -e "\ndependencyResolutionManagement {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}" >> "$SETTINGS_FILE"
    echo "✅ Configuration du repository Maven Central dans settings.gradle"
  fi
fi

# Vérifie si le build.gradle a déjà été corrigé
APP_GRADLE="android/app/build.gradle"
if [ -f "$APP_GRADLE" ]; then
  if grep -q "project(':capacitor-android')" "$APP_GRADLE"; then
    sed -i '' 's/implementation project('\'':capacitor-android'\'')/implementation "com.capacitorjs:android-capacitor:7.2.0"/' "$APP_GRADLE"
    echo "✅ Référence à capacitor-android corrigée dans app/build.gradle"
  fi
fi

# Vérifier tous les plugins capacitor
for PLUGIN_DIR in node_modules/@capacitor/*/android/build.gradle; do
  if grep -q "project(':capacitor-android')" "$PLUGIN_DIR"; then
    sed -i '' 's/implementation project('\'':capacitor-android'\'')/implementation "com.capacitorjs:android-capacitor:7.2.0"/' "$PLUGIN_DIR"
    PLUGIN_NAME=$(echo "$PLUGIN_DIR" | sed -E 's/node_modules\/@capacitor\/([^\/]+)\/android\/build.gradle/\1/')
    echo "✅ Référence corrigée dans le plugin @capacitor/$PLUGIN_NAME"
    # Créer un patch pour ce plugin
    npx patch-package "@capacitor/$PLUGIN_NAME"
  fi
done

echo "🔄 Application des patches avec patch-package..."
npx patch-package

echo "✅ Toutes les références à capacitor-android ont été corrigées." 