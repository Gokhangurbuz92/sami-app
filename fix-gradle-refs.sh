#!/bin/bash

echo "🔄 Correction des références à :capacitor-android dans tous les plugins..."

# D'abord, supprimons tous les anciens patches qui causent des problèmes
rm -f patches/@capacitor+*.patch

# Parcourons tous les plugins capacitor
for PLUGIN_DIR in node_modules/@capacitor/*/android/build.gradle; do
  echo "🔍 Traitement de $PLUGIN_DIR"
  # Utiliser une substitution simple et directe sans regexp complexe
  sed -i '' 's|implementation project('\'':capacitor-android'\'')|implementation "com.capacitorjs:android:7.2.0"|g' "$PLUGIN_DIR"
done

echo "✅ Toutes les références ont été corrigées."
echo "Essayez maintenant: cd android && ./gradlew :app:assembleDebug" 