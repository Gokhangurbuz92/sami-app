#!/bin/bash

# Afficher un message d'information
echo "🔄 Correction des fichiers de build Gradle pour la compatibilité avec Java 17..."

# 1. Corriger capacitor-android
echo "  • Correction de @capacitor/android..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle

# 2. Corriger capacitor-app
echo "  • Correction de @capacitor/app..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/app/android/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/app/android/build.gradle

# 3. Corriger capacitor-browser
echo "  • Correction de @capacitor/browser..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/browser/android/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/browser/android/build.gradle

# 4. Corriger capacitor-push-notifications
echo "  • Correction de @capacitor/push-notifications..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/push-notifications/android/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/push-notifications/android/build.gradle

# 5. Corriger capacitor-splash-screen
echo "  • Correction de @capacitor/splash-screen..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/splash-screen/android/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/splash-screen/android/build.gradle

# 6. Corriger capacitor-toast
echo "  • Correction de @capacitor/toast..."
sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/toast/android/build.gradle
sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' node_modules/@capacitor/toast/android/build.gradle

# 7. Corriger la compatibilité API dans CapacitorWebView.java
echo "  • Correction de CapacitorWebView.java pour APIs récentes..."
CAPACITOR_WEBVIEW_FILE="node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java"
if [ -f "$CAPACITOR_WEBVIEW_FILE" ]; then
    sed -i '' 's/Build.VERSION_CODES.VANILLA_ICE_CREAM/34/g' "$CAPACITOR_WEBVIEW_FILE"
    sed -i '' 's/android.R.attr.windowOptOutEdgeToEdgeEnforcement/0/g' "$CAPACITOR_WEBVIEW_FILE"
    sed -i '' 's/boolean foundOptOut = getContext().getTheme().resolveAttribute(0, value, true);/boolean foundOptOut = false;/g' "$CAPACITOR_WEBVIEW_FILE"
fi

# 8. Supprimer les avertissements de compileSdk
echo "  • Suppression des avertissements pour compileSdk 35..."
if ! grep -q "android.suppressUnsupportedCompileSdk" android/gradle.properties; then
    echo "" >> android/gradle.properties
    echo "# Supprimer les avertissements de compileSdk 35" >> android/gradle.properties
    echo "android.suppressUnsupportedCompileSdk=35" >> android/gradle.properties
fi

echo "✅ Toutes les corrections ont été appliquées avec succès!" 