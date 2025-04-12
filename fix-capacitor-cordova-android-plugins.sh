#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Début de la correction du module capacitor-cordova-android-plugins...${NC}"

# Vérifier si le module existe
if [ ! -d "node_modules/@capacitor/cordova-android-plugins" ]; then
    echo -e "${RED}Le module capacitor-cordova-android-plugins n'existe pas !${NC}"
    exit 1
fi

# Créer un backup
mkdir -p backup/capacitor-cordova-android-plugins
cp node_modules/@capacitor/cordova-android-plugins/build.gradle backup/capacitor-cordova-android-plugins/

# Modifier le fichier build.gradle
cat > node_modules/@capacitor/cordova-android-plugins/build.gradle << 'EOL'
apply plugin: 'com.android.library'

android {
    namespace "com.capacitorjs.cordova.plugins"
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
    implementation 'com.google.android.material:material:1.11.0'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    implementation project(':capacitor-android')
}
EOL

echo -e "${GREEN}Correction terminée avec succès !${NC}"
echo -e "${GREEN}Backup disponible dans backup/capacitor-cordova-android-plugins/build.gradle${NC}" 