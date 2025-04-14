# 📱 SAMI App – Application mobile pour foyers MNA

Cette application est destinée aux jeunes du foyer SAMI à Strasbourg, géré par la Fondation de la Maison du Diaconat.
Elle permet une communication simple et multilingue entre jeunes et référents (messagerie, notifications, traductions automatiques, etc.)

**Technos :** React + TypeScript, Firebase (Auth, Firestore, Storage, Messaging), Capacitor, i18n, Vite  
**Déploiement :** Android (.aab) + Firebase Hosting (version Web)  
**Statut :** ✅ Prête pour le Play Store (avril 2024)

---

## 🏠 Description détaillée

Bienvenue dans l'application officielle du **Foyer SAMI** à Strasbourg, gérée par la **Fondation de la Maison du Diaconat de Mulhouse**.

Cette application permet de faciliter la **communication**, le **suivi administratif** et l'**accompagnement socio-éducatif** des jeunes **MNA primo-arrivants**.

---

## 📱 Fonctionnalités principales

- 🔒 Connexion sécurisée (Firebase Auth)
- 👤 Rôles : `jeune`, `référent`, `co-référent`, `admin`
- 📆 Planning de stage
- 📋 Suivi des parcours (Parcours 2, contacts, promotion)
- 🩺 Gestion des rendez-vous médicaux
- 📬 Messagerie interne (temps réel, multi-rôles)
- 🌍 Traduction automatique des messages
- 🔔 Notifications push (FCM)
- 🧭 Multilingue : arabe, pashto, turc, somali, français, anglais, etc.
- ♿ Interface simple, lisible et accessible (FALC)

---

## 🚀 Installation

```bash
git clone https://github.com/Gokhangurbuz92/sami-app.git
cd sami-app
npm install
npm run dev
```

## 🔧 Configuration

Créer un fichier .env à la racine du projet :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GOOGLE_TRANSLATE_API_KEY=...
```

## 🛡 Sécurité & RGPD

Toutes les données sont :

- 🔐 Stockées de manière sécurisée sur Firebase
- 📍 Hébergées en Europe
- ✅ Protégées par des règles Firestore strictes selon les rôles

✨ Développé avec ❤️ par Gökhan GÜRBÜZ

[Site de la Fondation du Diaconat](https://www.diaconat-mulhouse.fr/)

## 📄 Licence

Ce projet est un outil interne destiné aux professionnels du secteur social.

# SAMI App

![SAMI App Logo](src/assets/img/logo.png)

## 📱 À propos

SAMI est une application mobile et web progressive (PWA) destinée aux foyers sociaux pour faciliter la communication entre les jeunes et les professionnels. L'application offre un système complet de gestion des rendez-vous, de notifications, de messagerie, et des outils éducatifs.

## ✨ Fonctionnalités

- 🔒 **Authentification** - Système de connexion sécurisé avec Firebase Auth
- 📅 **Planning** - Gestion des rendez-vous et événements
- 📝 **Notes** - Prise de notes personnalisées et partageables
- 💬 **Messagerie** - Communication entre jeunes et référents
- 🔔 **Notifications** - Alertes en temps réel pour les événements importants
- 🌐 **Multi-langues** - Support complet du français et d'autres langues
- 🖼️ **Interface intuitive** - Design adapté aux jeunes et aux professionnels
- 📊 **Panneau d'administration** - Gestion des utilisateurs et des droits

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Material-UI, Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Mobile**: Capacitor (iOS, Android)
- **Monitoring**: Sentry pour le suivi des erreurs et performances
- **CI/CD**: Scripts automatisés pour le déploiement

## 🚀 Installation

### Prérequis

- Node.js v18 ou supérieur
- npm 9 ou supérieur
- JDK 17 pour Android
- Xcode 14+ pour iOS
- Firebase CLI

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/sami-app.git
cd sami-app
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer l'environnement**

Créer un fichier `.env` à la racine du projet en suivant le modèle de `.env.example`:

```
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# Sentry
SENTRY_AUTH_TOKEN=your-sentry-token
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

4. **Lancer en développement**

```bash
npm run dev
```

## 📦 Compilation

### Web (PWA)

```bash
npm run build
```

### Android

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Pour créer un APK signé:

```bash
./build-aab-release.sh
```

### iOS

```bash
npm run build
npx cap sync ios
cd ios/App
pod install
```

Ouvrez le projet dans Xcode:

```bash
npx cap open ios
```

## 🧪 Tests

```bash
npm run test
```

Simulation des notifications push:

```bash
npm run simulate-wakeup
```

## 📊 Monitoring avec Sentry

Upload des sourcemaps pour le débogage:

```bash
./upload-sourcemaps.sh android production
```

## 📚 Structure du projet

```
sami-app/
├── android/                # Code spécifique à Android
├── ios/                    # Code spécifique à iOS
├── public/                 # Ressources statiques
├── src/
│   ├── assets/             # Images, polices, etc.
│   ├── components/         # Composants React réutilisables
│   ├── config/             # Configuration de Firebase, Sentry, etc.
│   ├── contexts/           # Contextes React (Auth, Theme, etc.)
│   ├── hooks/              # Hooks personnalisés
│   ├── i18n/               # Traductions et configuration i18n
│   ├── pages/              # Pages/Écrans de l'application 
│   ├── scripts/            # Scripts utilitaires (simulateWakeup, etc.)
│   ├── services/           # Services (notifications, API, etc.)
│   ├── styles/             # Styles CSS globaux
│   ├── types/              # Définitions TypeScript
│   ├── utils/              # Fonctions utilitaires
│   ├── App.tsx             # Composant racine
│   └── main.tsx            # Point d'entrée
├── capacitor.config.ts     # Configuration Capacitor
├── index.html              # Template HTML
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
└── vite.config.ts          # Configuration Vite
```

## 📋 Commandes disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Compiler l'application pour production
- `npm run preview` - Prévisualiser la version de production
- `npm run test` - Exécuter les tests
- `npm run lint` - Linter le code
- `npm run format` - Formater le code
- `npm run cap:sync` - Synchroniser les fichiers avec les projets natifs
- `npm run cap:open:android` - Ouvrir le projet Android
- `npm run cap:open:ios` - Ouvrir le projet iOS
- `npm run simulate-wakeup` - Simuler les notifications de réveil

## 🔒 Sécurité

- Authentification Firebase avec vérification d'email
- Règles de sécurité Firestore configurées
- Stockage sécurisé des tokens
- Validation des données côté client et serveur

## 🤝 Contribution

1. Forker le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Committer vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 📞 Contact

Pour toute question ou suggestion, veuillez contacter [votre-email@example.com](mailto:votre-email@example.com).

---

Développé avec ❤️ pour l'association SAMI Strasbourg
