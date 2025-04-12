#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Début de la correction du module capacitor-android...${NC}"

# Vérifier si le module existe
if [ ! -d "node_modules/@capacitor/android" ]; then
    echo -e "${RED}Le module @capacitor/android n'est pas installé${NC}"
    exit 1
fi

# Créer un backup
mkdir -p backup/capacitor-android
cp node_modules/@capacitor/android/capacitor/build.gradle backup/capacitor-android/

# Modifier le fichier build.gradle
cat > node_modules/@capacitor/android/capacitor/build.gradle << 'EOL'
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.3.0'
    }
}

apply plugin: 'com.android.library'

android {
    namespace "com.capacitorjs.android"
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    lintOptions {
        abortOnError false
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.webkit:webkit:1.8.0'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
EOL

echo -e "${GREEN}Correction terminée avec succès !${NC}"
echo -e "${YELLOW}Backup disponible dans backup/capacitor-android/build.gradle${NC}" 