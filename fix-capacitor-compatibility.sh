#!/bin/bash

# Chemin vers le fichier à modifier
CAPACITOR_WEBVIEW_FILE="node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java"

# Vérifier si le fichier existe
if [ ! -f "$CAPACITOR_WEBVIEW_FILE" ]; then
    echo "❌ Erreur : Le fichier $CAPACITOR_WEBVIEW_FILE n'existe pas."
    exit 1
fi

# Créer une sauvegarde du fichier original
cp "$CAPACITOR_WEBVIEW_FILE" "${CAPACITOR_WEBVIEW_FILE}.bak"

# Remplacer les références aux APIs non disponibles avec notre version du SDK
sed -i '' 's/Build.VERSION_CODES.VANILLA_ICE_CREAM/34/g' "$CAPACITOR_WEBVIEW_FILE"
sed -i '' 's/android.R.attr.windowOptOutEdgeToEdgeEnforcement/0/g' "$CAPACITOR_WEBVIEW_FILE"
sed -i '' 's/boolean foundOptOut = getContext().getTheme().resolveAttribute(0, value, true);/boolean foundOptOut = false;/g' "$CAPACITOR_WEBVIEW_FILE"

echo "✅ Correctifs de compatibilité appliqués avec succès à $CAPACITOR_WEBVIEW_FILE" 