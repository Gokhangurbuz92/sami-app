#!/usr/bin/env node

/**
 * Script d'exécution de la simulation de réveil
 * Ce script est conçu pour être exécuté directement ou dans un environnement CI/CD
 * 
 * Utilisation:
 *   node run-wakeup.cjs
 *   npm run simulate:wakeup
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  logDirectory: path.join(__dirname, 'logs'),
  logToFile: true
};

// Créer le répertoire de logs s'il n'existe pas
if (CONFIG.logToFile && !fs.existsSync(CONFIG.logDirectory)) {
  fs.mkdirSync(CONFIG.logDirectory, { recursive: true });
}

console.log('====== Simulation de réveil SAMI - Démarrage ======');
console.log(`📅 Date: ${new Date().toLocaleString()}`);
console.log('====================================================');

// Configuration des variables d'environnement
const env = { ...process.env };
env.LOG_PATH = CONFIG.logDirectory;

// Exécution directe de ts-node avec notre script
const result = spawnSync('npx', ['ts-node', '--transpile-only', '-r', 'dotenv/config', 'src/scripts/simulateWakeup.ts'], {
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