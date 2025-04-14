#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de test ===${NC}"

# Créer le dossier tests s'il n'existe pas
mkdir -p tests

# Configurer le script de test unitaire
echo -e "${YELLOW}Configuration du script de test unitaire...${NC}"
cat > test-unit.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Exécution des tests unitaires ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Exécuter les tests unitaires
echo -e "${YELLOW}Exécution des tests unitaires...${NC}"
npm run test:unit

echo -e "${GREEN}✓ Tests unitaires terminés${NC}"
EOL

# Configurer le script de test d'intégration
echo -e "${YELLOW}Configuration du script de test d'intégration...${NC}"
cat > test-integration.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Exécution des tests d'intégration ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Démarrer le serveur de test
echo -e "${YELLOW}Démarrage du serveur de test...${NC}"
npm run test:server &

# Attendre que le serveur démarre
sleep 5

# Exécuter les tests d'intégration
echo -e "${YELLOW}Exécution des tests d'intégration...${NC}"
npm run test:integration

# Arrêter le serveur de test
echo -e "${YELLOW}Arrêt du serveur de test...${NC}"
pkill -f "test:server"

echo -e "${GREEN}✓ Tests d'intégration terminés${NC}"
EOL

# Configurer le script de test de couverture
echo -e "${YELLOW}Configuration du script de test de couverture...${NC}"
cat > test-coverage.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Exécution des tests de couverture ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Exécuter les tests de couverture
echo -e "${YELLOW}Exécution des tests de couverture...${NC}"
npm run test:coverage

# Générer le rapport de couverture
echo -e "${YELLOW}Génération du rapport de couverture...${NC}"
npm run test:coverage:report

echo -e "${GREEN}✓ Tests de couverture terminés${NC}"
echo -e "${YELLOW}⚠️ Le rapport de couverture est disponible dans le dossier coverage/${NC}"
EOL

# Rendre les scripts exécutables
chmod +x test-unit.sh test-integration.sh test-coverage.sh

# Créer les fichiers de test de base
echo -e "${YELLOW}Création des fichiers de test de base...${NC}"

# Exemple de test unitaire
cat > tests/example.test.ts << 'EOL'
import { describe, it, expect } from 'vitest';

describe('Example', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
EOL

# Exemple de test d'intégration
cat > tests/example.integration.test.ts << 'EOL'
import { describe, it, expect } from 'vitest';
import { setupTestServer } from './utils';

describe('Example Integration', () => {
  it('should pass', async () => {
    const server = await setupTestServer();
    expect(server).toBeDefined();
    await server.close();
  });
});
EOL

# Utilitaires de test
cat > tests/utils.ts << 'EOL'
import { createServer } from 'http';

export async function setupTestServer() {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });

  await new Promise<void>((resolve) => {
    server.listen(3000, () => {
      console.log('Test server running on port 3000');
      resolve();
    });
  });

  return {
    close: () => new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    })
  };
}
EOL

echo -e "${GREEN}✓ Scripts de test configurés avec succès${NC}" 