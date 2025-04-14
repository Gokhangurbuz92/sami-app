#!/usr/bin/env node
// Script de simulation de réveil - Compatible avec exécution CLI
// Ce script ne dépend pas de Vite et peut être exécuté directement

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase-node';
import { checkWakeupList, sendMessage } from '../services/wakeupService-node';

// Configuration
const CONFIG = {
  logToFile: true,
  logToConsole: true,
  logFilePath: process.env.LOG_PATH || 'logs',
  logFileName: `wakeup-simulation-${new Date().toISOString().split('T')[0]}.log`
};

// Fonction pour écrire dans un fichier de log
const writeLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
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
      
      // Créer le répertoire de logs s'il n'existe pas
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
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
    type: 'medical' as const,
    details: 'Rendez-vous médical - Dr. Martin à 9h00',
    time: '09:00'
  },
  {
    userId: 'user2',
    date: Timestamp.fromDate(new Date()),
    type: 'school' as const,
    details: 'Cours de mathématiques à 8h30',
    time: '08:30'
  }
];

const simulateWakeup = async () => {
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
    
    writeLog('Notification envoyée au groupe de professionnels', 'success');
    writeLog('Simulation terminée avec succès', 'success');
  } catch (error) {
    writeLog(`Erreur lors de la simulation: ${error}`, 'error');
    // En environnement CI, on pourrait vouloir faire échouer le processus
    if (process.env.CI) {
      process.exit(1);
    }
  }
};

// Fonction principale avec gestion des erreurs pour CI
export async function main() {
  console.log("Démarrage de la fonction principale main()");
  try {
    await simulateWakeup();
    return 0; // Succès
  } catch (error) {
    writeLog(`Erreur non gérée: ${error}`, 'error');
    return 1; // Échec
  }
}

// Exécuter la simulation directement si le script est appelé directement
console.log("Démarrage du script simulateWakeup.ts");

main()
  .then(exitCode => {
    console.log(`Simulation terminée avec code: ${exitCode}`);
    if (exitCode !== 0 && process.env.CI) {
      process.exit(exitCode);
    }
    writeLog('Exécution terminée', 'info');
  })
  .catch(error => {
    console.error(`Erreur fatale: ${error}`);
    writeLog(`Erreur fatale: ${error}`, 'error');
    if (process.env.CI) {
      process.exit(1);
    }
  });

// Exporter une déclaration vide pour rendre ce fichier compatible avec le mode de modules isolés
export {}; 