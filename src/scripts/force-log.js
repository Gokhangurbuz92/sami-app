// Ce script force l'écriture des logs dans un fichier
const fs = require('fs');
const path = require('path');

// Créer le dossier de logs s'il n'existe pas
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Nom du fichier de log
const logFile = path.join(logDir, `wakeup-simulation-${new Date().toISOString().split('T')[0]}.log`);

// Rediriger stdout et stderr vers le fichier
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Sauvegarder les fonctions console originales
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Remplacer console.log pour écrire dans le fichier de log
console.log = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Écrire dans le fichier
  logStream.write(`[${new Date().toISOString()}] [LOG] ${message}\n`);
  
  // Appel de la fonction originale
  originalConsoleLog.apply(console, arguments);
};

// Remplacer console.error
console.error = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Écrire dans le fichier
  logStream.write(`[${new Date().toISOString()}] [ERROR] ${message}\n`);
  
  // Appel de la fonction originale
  originalConsoleError.apply(console, arguments);
};

// Remplacer console.warn
console.warn = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Écrire dans le fichier
  logStream.write(`[${new Date().toISOString()}] [WARN] ${message}\n`);
  
  // Appel de la fonction originale
  originalConsoleWarn.apply(console, arguments);
};

// Remplacer console.info
console.info = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Écrire dans le fichier
  logStream.write(`[${new Date().toISOString()}] [INFO] ${message}\n`);
  
  // Appel de la fonction originale
  originalConsoleInfo.apply(console, arguments);
};

// Log de démarrage
console.log('Système de logging forcé initialisé');

// Exporter une fonction d'arrêt
module.exports = {
  stop: function() {
    // Restaurer les fonctions console originales
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    
    // Fermer le stream
    logStream.end();
  }
}; 