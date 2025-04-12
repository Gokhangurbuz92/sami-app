#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Début de la correction de la configuration Java Android...${NC}"

# Vérifier si le fichier build.gradle existe
if [ ! -f "android/app/build.gradle" ]; then
    echo -e "${RED}Le fichier android/app/build.gradle n'existe pas !${NC}"
    exit 1
fi

# Créer un backup
mkdir -p backup/android
cp android/app/build.gradle backup/android/build.gradle.bak

# Modifier le fichier build.gradle
cat > android/app/build.gradle << 'EOL'
apply plugin: 'com.android.application'

android {
    namespace "com.sami.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.sami.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
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
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.legacy:legacy-support-v4:$androidxLegacySupportVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.warn("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
EOL

echo -e "${GREEN}Configuration Java Android corrigée avec succès !${NC}"
echo -e "${GREEN}Backup disponible dans backup/android/build.gradle.bak${NC}" 