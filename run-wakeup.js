#!/usr/bin/env node

/**
 * Script d'exécution de la simulation de réveil
 * Ce script est conçu pour être exécuté directement ou dans un environnement CI/CD
 * 
 * Utilisation:
 *   node run-wakeup.js
 *   npm run simulate:wakeup
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// S'assurer que les dépendances sont installées
try {
  require.resolve('ts-node');
  require.resolve('dotenv');
} catch (error) {
  console.error('❌ Dépendances manquantes. Installation de ts-node et dotenv...');
  spawnSync('npm', ['install', '--save-dev', 'ts-node', 'dotenv'], { stdio: 'inherit' });
}

// Configuration
const CONFIG = {
  scriptPath: path.join(__dirname, 'src/scripts/simulateWakeup.ts'),
  tsNodeOptions: '--transpile-only',
  logDirectory: path.join(__dirname, 'logs'),
  logToFile: true
};

// Vérifier si le script existe
if (!fs.existsSync(CONFIG.scriptPath)) {
  console.error(`❌ Script introuvable: ${CONFIG.scriptPath}`);
  process.exit(1);
}

// Créer le répertoire de logs s'il n'existe pas
if (CONFIG.logToFile && !fs.existsSync(CONFIG.logDirectory)) {
  fs.mkdirSync(CONFIG.logDirectory, { recursive: true });
}

console.log('====== Simulation de réveil SAMI - Démarrage ======');
console.log(`📂 Script: ${CONFIG.scriptPath}`);
console.log(`📅 Date: ${new Date().toLocaleString()}`);
console.log('====================================================');

// Configuration des variables d'environnement
const env = { ...process.env };
env.TS_NODE_PROJECT = path.join(__dirname, 'tsconfig.scripts.json');
env.LOG_PATH = CONFIG.logDirectory;

// Exécution du script
const result = spawnSync('npx', ['ts-node', CONFIG.tsNodeOptions, CONFIG.scriptPath], {
  stdio: 'inherit',
  env: env
});

// Gestion du code de sortie
if (result.status !== 0) {
  console.error(`❌ La simulation a échoué avec le code d'erreur: ${result.status}`);
  process.exit(result.status || 1);
} else {
  console.log('✅ Simulation terminée avec succès!');
  console.log(`📝 Consultez les logs dans: ${CONFIG.logDirectory}`);
}

process.exit(0); 