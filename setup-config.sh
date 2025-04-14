#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des fichiers de configuration ===${NC}"

# Configurer le fichier .env
echo -e "${YELLOW}Configuration du fichier .env...${NC}"
cat > .env << 'EOL'
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=app-sami-1ba47
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
VITE_SENTRY_DSN=https://a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
EOL

# Configurer le fichier .env.example
echo -e "${YELLOW}Configuration du fichier .env.example...${NC}"
cat > .env.example << 'EOL'
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
VITE_SENTRY_DSN=
VITE_GOOGLE_TRANSLATE_API_KEY=
EOL

# Configurer le fichier capacitor.config.ts
echo -e "${YELLOW}Configuration du fichier capacitor.config.ts...${NC}"
cat > capacitor.config.ts << 'EOL'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gokhangurbuz.samiapp',
  appName: 'SAMI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
EOL

# Configurer le fichier firebase.json
echo -e "${YELLOW}Configuration du fichier firebase.json...${NC}"
cat > firebase.json << 'EOL'
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOL

# Configurer le fichier firestore.rules
echo -e "${YELLOW}Configuration du fichier firestore.rules...${NC}"
cat > firestore.rules << 'EOL'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (resource.data.participants.hasAny([request.auth.uid]) || 
         request.auth.token.role == 'admin');
    }
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants.hasAny([request.auth.uid]);
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/chats/$(request.resource.data.chatId)).data.participants.hasAny([request.auth.uid]);
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
  }
}
EOL

# Configurer le fichier firestore.indexes.json
echo -e "${YELLOW}Configuration du fichier firestore.indexes.json...${NC}"
cat > firestore.indexes.json << 'EOL'
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chatId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "lastMessage.createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
EOL

# Configurer le fichier storage.rules
echo -e "${YELLOW}Configuration du fichier storage.rules...${NC}"
cat > storage.rules << 'EOL'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /chats/{chatId}/{allPaths=**} {
      allow read: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
EOL

# Configurer le fichier sentry.properties
echo -e "${YELLOW}Configuration du fichier sentry.properties...${NC}"
cat > sentry.properties << 'EOL'
defaults.url=https://sentry.io/
defaults.org=your-org
defaults.project=your-project
auth.token=your-auth-token
EOL

echo -e "${GREEN}✓ Fichiers de configuration configurés avec succès${NC}" 