#!/bin/bash

echo "🔍 Vérification des fichiers de patch..."

PATCH_FILE="patches/@capacitor/app/fix-dependencies.patch"

if [ ! -f "$PATCH_FILE" ]; then
  echo "❌ Fichier de patch introuvable : $PATCH_FILE"
  exit 1
fi

echo "✅ Patch trouvé. Application en cours..."

patch -p1 < "$PATCH_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Échec de l'application du patch."
  exit 1
fi

echo "🔄 Création du patch pour patch-package..."
npx patch-package @capacitor/app

echo "✅ Patch appliqué avec succès." 