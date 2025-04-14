#!/usr/bin/env node

// Script wrapper pour exécuter la simulation avec logs forcés
console.log('Démarrage du script de simulation avec logs forcés');

// Charger le module de logging forcé
require('./force-log');
console.log('Module de logging forcé chargé');

// Définir les variables d'environnement
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
console.log(`Environnement: ${process.env.NODE_ENV}`);

// Exécuter le script vite-node
console.log('Exécution du script avec vite-node...');

const { spawnSync } = require('child_process');
const path = require('path');

// Chemin vers le script vite-scripts.ts
const scriptPath = path.resolve(__dirname, '../vite-scripts.ts');
console.log(`Chemin du script: ${scriptPath}`);

// Exécuter vite-node
const result = spawnSync('npx', ['vite-node', scriptPath], {
  stdio: 'inherit',
  env: process.env
});

// Vérifier le résultat
if (result.error) {
  console.error('Erreur lors de l\'exécution:', result.error);
  process.exit(1);
}

console.log(`Script terminé avec le code: ${result.status}`);
process.exit(result.status || 0); 