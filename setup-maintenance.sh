#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de maintenance ===${NC}"

# Configurer le script de nettoyage
echo -e "${YELLOW}Configuration du script de nettoyage...${NC}"
cat > clean.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Nettoyage du projet ===${NC}"

# Supprimer les dossiers de build
echo -e "${YELLOW}Suppression des dossiers de build...${NC}"
rm -rf node_modules
rm -rf dist
rm -rf android/app/build
rm -rf ios/build

# Supprimer les fichiers .DS_Store
echo -e "${YELLOW}Suppression des fichiers .DS_Store...${NC}"
find . -name ".DS_Store" -delete

# Supprimer les fichiers .log
echo -e "${YELLOW}Suppression des fichiers .log...${NC}"
find . -name "*.log" -delete

echo -e "${GREEN}✓ Nettoyage terminé${NC}"
EOL

# Configurer le script de vérification
echo -e "${YELLOW}Configuration du script de vérification...${NC}"
cat > check.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification du projet ===${NC}"

# Vérifier les dépendances
echo -e "${YELLOW}Vérification des dépendances...${NC}"
npm install

# Vérifier le linting
echo -e "${YELLOW}Vérification du linting...${NC}"
npm run lint

# Vérifier le formatage
echo -e "${YELLOW}Vérification du formatage...${NC}"
npm run format

# Vérifier les tests
echo -e "${YELLOW}Vérification des tests...${NC}"
npm run test

# Vérifier la construction
echo -e "${YELLOW}Vérification de la construction...${NC}"
npm run build

echo -e "${GREEN}✓ Vérification terminée${NC}"
EOL

# Configurer le script de mise à jour
echo -e "${YELLOW}Configuration du script de mise à jour...${NC}"
cat > update.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Mise à jour du projet ===${NC}"

# Mettre à jour npm
echo -e "${YELLOW}Mise à jour de npm...${NC}"
npm install -g npm@latest

# Mettre à jour les dépendances
echo -e "${YELLOW}Mise à jour des dépendances...${NC}"
npm update

# Mettre à jour Capacitor
echo -e "${YELLOW}Mise à jour de Capacitor...${NC}"
npx cap update

# Mettre à jour les plugins
echo -e "${YELLOW}Mise à jour des plugins...${NC}"
npx cap sync

echo -e "${GREEN}✓ Mise à jour terminée${NC}"
EOL

# Configurer le script de sauvegarde
echo -e "${YELLOW}Configuration du script de sauvegarde...${NC}"
cat > backup.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Sauvegarde du projet ===${NC}"

# Créer un dossier de sauvegarde
echo -e "${YELLOW}Création du dossier de sauvegarde...${NC}"
BACKUP_DIR="backup/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

# Copier les fichiers importants
echo -e "${YELLOW}Copie des fichiers importants...${NC}"
cp -r src "$BACKUP_DIR"
cp -r public "$BACKUP_DIR"
cp package.json "$BACKUP_DIR"
cp package-lock.json "$BACKUP_DIR"
cp tsconfig.json "$BACKUP_DIR"
cp vite.config.ts "$BACKUP_DIR"
cp .env "$BACKUP_DIR"
cp .env.example "$BACKUP_DIR"
cp .env.local "$BACKUP_DIR"
cp .env.production "$BACKUP_DIR"
cp .env.sentry-build-plugin "$BACKUP_DIR"
cp .eslintrc.json "$BACKUP_DIR"
cp .prettierrc "$BACKUP_DIR"
cp firebase.json "$BACKUP_DIR"
cp firestore.rules "$BACKUP_DIR"
cp firestore.indexes.json "$BACKUP_DIR"
cp storage.rules "$BACKUP_DIR"
cp sentry.properties "$BACKUP_DIR"
cp capacitor.config.ts "$BACKUP_DIR"

# Compresser la sauvegarde
echo -e "${YELLOW}Compression de la sauvegarde...${NC}"
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Supprimer le dossier temporaire
echo -e "${YELLOW}Suppression du dossier temporaire...${NC}"
rm -rf "$BACKUP_DIR"

echo -e "${GREEN}✓ Sauvegarde terminée${NC}"
echo -e "${YELLOW}⚠️ Fichier de sauvegarde : $BACKUP_DIR.tar.gz${NC}"
EOL

# Rendre les scripts exécutables
chmod +x clean.sh check.sh update.sh backup.sh

echo -e "${GREEN}✓ Scripts de maintenance configurés avec succès${NC}" 