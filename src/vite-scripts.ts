// Ce fichier sert de point d'entrée pour exécuter des scripts dans le contexte de Vite
// Cela permet d'avoir accès aux variables d'environnement de Vite (import.meta.env.*)

console.log('===== DÉMARRAGE DU SCRIPT VITE =====');

try {
  console.log('Tentative d\'importation de simulateWakeup...');
  const simulateWakeupModule = await import('./scripts/simulateWakeup');
  console.log('Module importé:', Object.keys(simulateWakeupModule));
  
  if (typeof simulateWakeupModule.main !== 'function') {
    console.error('La fonction main n\'est pas une fonction!', typeof simulateWakeupModule.main);
    process.exit(1);
  }
  
  const runWakeupSimulation = simulateWakeupModule.main;

  // Configuration de l'environnement
  process.env.LOG_PATH = process.env.LOG_PATH || 'logs';
  process.env.CI = process.env.CI || '';

  // Fonction principale d'exécution
  async function executeScript() {
    console.log('Début de l\'exécution du script de simulation');
    
    try {
      const exitCode = await runWakeupSimulation();
      console.log(`Script terminé avec le code: ${exitCode}`);
      
      // Si nous sommes en CI et que le script a échoué, on quitte avec le même code
      if (exitCode !== 0 && process.env.CI) {
        process.exit(exitCode);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution du script:', error);
      if (process.env.CI) {
        process.exit(1);
      }
    }
  }

  // Exécuter le script
  console.log('Avant l\'appel de executeScript()');
  await executeScript();
  console.log('Après l\'appel de executeScript()');
} catch (error) {
  console.error('Erreur lors de l\'importation ou l\'exécution:', error);
  process.exit(1);
}

// Export vide pour faire de ce fichier un module ES
export {}; 