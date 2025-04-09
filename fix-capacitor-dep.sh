#!/bin/bash

# Vérifier si capacitor.settings.gradle existe et contient les bons chemins
if grep -q "projectDir = new File('')" "android/capacitor.settings.gradle"; then
  echo "🔄 Correction des chemins dans capacitor.settings.gradle"
  sed -i '' 's|project('\''.*'\'').projectDir = new File('\'''\'')|project('\'':capacitor-android'\'').projectDir = new File('\''../node_modules/@capacitor/android/capacitor'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':capacitor-app'\'').projectDir = new File('\'''\'')|project('\'':capacitor-app'\'').projectDir = new File('\''../node_modules/@capacitor/app/android'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':capacitor-browser'\'').projectDir = new File('\'''\'')|project('\'':capacitor-browser'\'').projectDir = new File('\''../node_modules/@capacitor/browser/android'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':capacitor-push-notifications'\'').projectDir = new File('\'''\'')|project('\'':capacitor-push-notifications'\'').projectDir = new File('\''../node_modules/@capacitor/push-notifications/android'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':capacitor-splash-screen'\'').projectDir = new File('\'''\'')|project('\'':capacitor-splash-screen'\'').projectDir = new File('\''../node_modules/@capacitor/splash-screen/android'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':capacitor-toast'\'').projectDir = new File('\'''\'')|project('\'':capacitor-toast'\'').projectDir = new File('\''../node_modules/@capacitor/toast/android'\'')|' "android/capacitor.settings.gradle"
  sed -i '' 's|project('\'':sentry-capacitor'\'').projectDir = new File('\'''\'')|project('\'':sentry-capacitor'\'').projectDir = new File('\''../node_modules/@sentry/capacitor/android'\'')|' "android/capacitor.settings.gradle"
fi

# Réappliquer les patches avec patch-package
echo "🔄 Application des patches avec patch-package"
npx patch-package

echo "✅ Corrections appliquées. Exécutez maintenant: cd android && ./gradlew clean :app:assembleDebug" 