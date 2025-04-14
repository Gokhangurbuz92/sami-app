#!/usr/bin/env node

/**
 * Script wrapper pour la simulation de réveil
 * Peut être utilisé dans un environnement CI/CD ou manuellement
 */

console.log('====== Simulation de réveil SAMI - Démarrage ======');
console.log('Date et heure:', new Date().toISOString());
console.log('Environnement:', process.env.NODE_ENV || 'development');

// Création du dossier de logs
const fs = require('fs');
const path = require('path');
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  console.log('Création du dossier logs...');
  fs.mkdirSync(logDir, { recursive: true });
}

// Nom du fichier de log
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFile = path.join(logDir, `wakeup-simulation-${timestamp}.log`);
console.log('Fichier de log:', logFile);

// Redirection des logs
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Remplacer console.log
console.log = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  logStream.write(`[${new Date().toISOString()}] [INFO] ${message}\n`);
  originalConsoleLog.apply(console, arguments);
};

// Remplacer console.error
console.error = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  logStream.write(`[${new Date().toISOString()}] [ERROR] ${message}\n`);
  originalConsoleError.apply(console, arguments);
};

// Exécution du script
const { spawnSync } = require('child_process');
console.log('Exécution du script de simulation...');

// Déterminer si on doit utiliser tsx ou vite-node selon les options
const useVite = process.argv.includes('--vite');
const isCI = process.argv.includes('--ci') || process.env.CI === 'true';
const isDebug = process.argv.includes('--debug');

const env = {
  ...process.env,
  NODE_ENV: isDebug ? 'development' : 'production',
  CI: isCI ? 'true' : '',
  DEBUG: isDebug ? 'true' : ''
};

let command, args;
if (useVite) {
  console.log('Utilisation de vite-node');
  command = 'npx';
  args = ['vite-node', 'src/vite-scripts.ts'];
} else {
  console.log('Utilisation de tsx');
  command = 'npx';
  args = ['tsx', 'src/scripts/simulateWakeup.ts'];
}

console.log(`Commande: ${command} ${args.join(' ')}`);

// Exécution du script
const result = spawnSync(command, args, {
  stdio: 'inherit',
  env
});

// Vérification du résultat
if (result.error) {
  console.error('Erreur lors de l\'exécution:', result.error);
  process.exit(1);
}

console.log(`Script terminé avec code: ${result.status}`);
console.log('====== Simulation de réveil SAMI - Terminée ======');

// Fermeture du fichier de log
logStream.end();

// Sortie avec le code d'état
process.exit(result.status || 0); 