import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDxBm0urtZBgYT5vP84OsqDXZXOQNV8IQU",
  authDomain: "app-sami-1ba47.firebaseapp.com",
  projectId: "app-sami-1ba47",
  storageBucket: "app-sami-1ba47.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firebase Messaging and get a reference to the service
export const messaging = isSupported().then(yes => yes ? getMessaging(app) : null);

export default app; 