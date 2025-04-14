// Configuration Firebase pour scripts Node.js (non-Vite)
// Ce fichier est utilisé par les scripts CLI qui ne passent pas par Vite
import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Charger les variables d'environnement du fichier .env
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Vérification des variables d'environnement
if (!firebaseConfig.apiKey) {
  console.error('❌ Variables Firebase manquantes dans le fichier .env');
  console.error('Assurez-vous que votre fichier .env contient toutes les variables VITE_FIREBASE_*');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Exporter l'app Firebase pour être utilisée dans d'autres modules
export { app as firebaseApp };

export default app; 