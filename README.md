# 🏠 SAMI App – Application pour le Foyer SAMI (MNA)

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
