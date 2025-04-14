#!/usr/bin/env node

/**
 * Script simple de simulation de réveil pour SAMI
 * Version JavaScript pure, indépendante de TypeScript
 */

// Charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

// Configuration Firebase
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

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuration du logger
const CONFIG = {
  logToFile: true,
  logToConsole: true,
  logFilePath: process.env.LOG_PATH || 'logs',
  logFileName: `wakeup-simulation-${new Date().toISOString().split('T')[0]}.log`
};

// Créer le répertoire de logs s'il n'existe pas
if (CONFIG.logToFile && !fs.existsSync(CONFIG.logFilePath)) {
  fs.mkdirSync(CONFIG.logFilePath, { recursive: true });
}

// Fonction pour écrire dans un fichier de log
const writeLog = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  // Log dans la console
  if (CONFIG.logToConsole) {
    if (type === 'error') {
      console.error(formattedMessage);
    } else if (type === 'success') {
      console.log('\x1b[32m%s\x1b[0m', formattedMessage); // Vert pour succès
    } else {
      console.log(formattedMessage);
    }
  }
  
  // Log dans un fichier
  if (CONFIG.logToFile) {
    try {
      const logDir = CONFIG.logFilePath;
      const logFile = path.join(logDir, CONFIG.logFileName);
      
      fs.appendFileSync(logFile, formattedMessage + '\n');
    } catch (error) {
      console.error(`Erreur d'écriture dans le fichier de log: ${error}`);
    }
  }
};

// Données de test
const mockAppointments = [
  {
    userId: 'user1',
    date: Timestamp.fromDate(new Date()),
    type: 'medical',
    details: 'Rendez-vous médical - Dr. Martin à 9h00',
    time: '09:00'
  },
  {
    userId: 'user2',
    date: Timestamp.fromDate(new Date()),
    type: 'school',
    details: 'Cours de mathématiques à 8h30',
    time: '08:30'
  }
];

// Fonction pour envoyer un message
async function sendMessage(message) {
  try {
    console.log(`[WAKEUP] Envoi d'un message au groupe ${message.chatId}:`);
    console.log(`[WAKEUP] Contenu: ${message.content}`);
    
    // Enregistrer le message dans Firestore
    const messageRef = await addDoc(collection(db, "messages"), {
      ...message,
      timestamp: Timestamp.now()
    });
    
    console.log(`[WAKEUP] Message enregistré avec l'ID: ${messageRef.id}`);
    return { id: messageRef.id, ...message };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
}

// Fonction principale de vérification des réveils
async function checkWakeupList(options = {}) {
  try {
    console.log("[WAKEUP] Démarrage de la vérification des réveils");
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`[WAKEUP] Recherche des rendez-vous entre ${today.toISOString()} et ${tomorrow.toISOString()}`);

    // Requête pour les rendez-vous médicaux
    const medicalQuery = query(
      collection(db, 'appointments'),
      where('date', '>=', today),
      where('date', '<', tomorrow),
      where('type', '==', 'medical')
    );

    // Requête pour les cours avant 10h
    const schoolQuery = query(
      collection(db, 'appointments'),
      where('date', '>=', today),
      where('date', '<', tomorrow),
      where('type', '==', 'school'),
      where('time', '<', '10:00')
    );

    console.log("[WAKEUP] Exécution des requêtes Firestore");
    
    const [medicalSnap, schoolSnap] = await Promise.all([
      getDocs(medicalQuery),
      getDocs(schoolQuery)
    ]);

    const appointments = [
      ...medicalSnap.docs.map(doc => doc.data()),
      ...schoolSnap.docs.map(doc => doc.data())
    ];

    console.log(`[WAKEUP] ${appointments.length} rendez-vous trouvés pour aujourd'hui`);

    // Si des rendez-vous sont trouvés ou si nous avons des mock appointments, envoyer la notification
    if (appointments.length > 0 || mockAppointments.length > 0) {
      // Utiliser les mockAppointments si aucun rendez-vous n'est trouvé (pour la simulation)
      const appsToUse = appointments.length > 0 ? appointments : mockAppointments;
      
      const message = `🔔 Liste de réveil du ${today.toLocaleDateString()}:\n\n` +
        appsToUse.map(app => 
          `• ${app.details} (${app.type === 'medical' ? 'Rendez-vous médical' : 'École'})`
        ).join('\n');

      await sendMessage({
        content: message,
        senderId: 'system',
        chatId: 'professionals',
        type: 'system'
      });
      
      console.log("[WAKEUP] Notification envoyée au groupe de professionnels");
      return true;
    } else {
      console.log("[WAKEUP] Aucun rendez-vous trouvé pour aujourd'hui, aucune notification envoyée");
      return false;
    }
  } catch (error) {
    console.error('[WAKEUP] Erreur lors de la vérification des réveils:', error);
    throw error;
  }
}

// Fonction principale de simulation
async function simulateWakeup() {
  try {
    writeLog('Démarrage de la simulation de réveil', 'info');

    // Ajouter les rendez-vous de test
    writeLog('Ajout des rendez-vous de test à Firestore...', 'info');
    const appointmentsRef = collection(db, 'appointments');
    for (const appointment of mockAppointments) {
      await addDoc(appointmentsRef, appointment);
      writeLog(`Rendez-vous ajouté: ${appointment.details}`, 'success');
    }

    writeLog('Tous les rendez-vous ont été ajoutés avec succès', 'success');
    
    // Exécution de l'algorithme de réveil
    writeLog('Exécution de l\'algorithme de réveil comme s\'il était 6:30 AM...', 'info');
    
    // Appel de la fonction checkWakeupList
    await checkWakeupList();
    
    writeLog('Simulation terminée avec succès', 'success');
    
    return 0; // Code de sortie réussi
  } catch (error) {
    writeLog(`Erreur lors de la simulation: ${error}`, 'error');
    return 1; // Code de sortie échec
  }
}

// Exécuter la simulation
console.log("====== Simulation de réveil SAMI - Démarrage ======");
console.log(`📅 Date: ${new Date().toLocaleString()}`);
console.log('====================================================');

// Fonction pour ajouter un rendez-vous de test
async function addTestAppointment(appointmentData) {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      date: appointmentData.date instanceof Date ? Timestamp.fromDate(appointmentData.date) : appointmentData.date
    });
    console.log(`Rendez-vous de test ajouté avec ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout du rendez-vous de test:", error);
    throw error;
  }
}

simulateWakeup()
  .then(exitCode => {
    console.log(`Simulation terminée avec code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(`Erreur fatale: ${error}`);
    process.exit(1);
  });

// module.exports = { checkWakeupList, addTestAppointment };
export { checkWakeupList, addTestAppointment };

// Exécutez directement si appelé en tant que script
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Exécution du script de vérification des rendez-vous...');
    
    // Paramètres optionnels depuis la ligne de commande
    const args = process.argv.slice(2);
    const options = {
        testMode: args.includes('--test') || args.includes('-t'),
        addTestData: args.includes('--add-test-data') || args.includes('-a'),
        verbose: args.includes('--verbose') || args.includes('-v')
    };
    
    checkWakeupList(options)
        .then(() => {
            console.log('Vérification des rendez-vous terminée avec succès.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Erreur lors de la vérification des rendez-vous:', error);
            process.exit(1);
        });
} 