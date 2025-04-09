#!/bin/bash

echo "🔄 Forçage de Java 17 pour toutes les compilations Gradle..."

# Modifier le script gradlew pour forcer Java 17
GRADLEW_FILE="android/gradlew"
JAVA_HOME_17="/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home"

if [ -f "$GRADLEW_FILE" ]; then
    # Faire une sauvegarde du fichier original
    cp "$GRADLEW_FILE" "${GRADLEW_FILE}.bak"
    
    # Ajouter l'option pour utiliser Java 17
    sed -i '' "s|DEFAULT_JVM_OPTS=\"\"|DEFAULT_JVM_OPTS=\"-Dorg.gradle.java.home=${JAVA_HOME_17}\"|g" "$GRADLEW_FILE"
    
    echo "✅ Script gradlew modifié pour utiliser Java 17"
else
    echo "❌ Le fichier gradlew n'a pas été trouvé dans android/"
    exit 1
fi

echo "🔄 Exécution de gradle clean pour réinitialiser la compilation..."
(cd android && ./gradlew clean)

echo "✅ La version Java a été forcée à Java 17 pour la compilation Gradle." 