#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de sécurité ===${NC}"

# Configurer le script de vérification des dépendances
echo -e "${YELLOW}Configuration du script de vérification des dépendances...${NC}"
cat > check-dependencies.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des dépendances ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Vérifier les vulnérabilités
echo -e "${YELLOW}Vérification des vulnérabilités...${NC}"
npm audit

# Vérifier les dépendances obsolètes
echo -e "${YELLOW}Vérification des dépendances obsolètes...${NC}"
npm outdated

echo -e "${GREEN}✓ Vérification des dépendances terminée${NC}"
EOL

# Configurer le script de vérification des secrets
echo -e "${YELLOW}Configuration du script de vérification des secrets...${NC}"
cat > check-secrets.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des secrets ===${NC}"

# Vérifier les fichiers .env
echo -e "${YELLOW}Vérification des fichiers .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${RED}❌ Le fichier .env ne doit pas être commité${NC}"
fi

if [ -f ".env.local" ]; then
    echo -e "${RED}❌ Le fichier .env.local ne doit pas être commité${NC}"
fi

# Vérifier les clés API
echo -e "${YELLOW}Vérification des clés API...${NC}"
find . -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -exec grep -l "API_KEY" {} \; | while read file; do
    echo -e "${RED}❌ Clé API trouvée dans $file${NC}"
done

# Vérifier les mots de passe
echo -e "${YELLOW}Vérification des mots de passe...${NC}"
find . -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -exec grep -l "password" {} \; | while read file; do
    echo -e "${RED}❌ Mot de passe trouvé dans $file${NC}"
done

echo -e "${GREEN}✓ Vérification des secrets terminée${NC}"
EOL

# Configurer le script de vérification des permissions
echo -e "${YELLOW}Configuration du script de vérification des permissions...${NC}"
cat > check-permissions.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des permissions ===${NC}"

# Vérifier les permissions des fichiers
echo -e "${YELLOW}Vérification des permissions des fichiers...${NC}"
find . -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -exec stat -f "%Sp %Su:%Sg %N" {} \; | while read line; do
    if [[ $line == *"777"* ]]; then
        echo -e "${RED}❌ Permission trop permissive: $line${NC}"
    fi
done

# Vérifier les permissions des dossiers
echo -e "${YELLOW}Vérification des permissions des dossiers...${NC}"
find . -type d -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -exec stat -f "%Sp %Su:%Sg %N" {} \; | while read line; do
    if [[ $line == *"777"* ]]; then
        echo -e "${RED}❌ Permission trop permissive: $line${NC}"
    fi
done

echo -e "${GREEN}✓ Vérification des permissions terminée${NC}"
EOL

# Configurer le script de vérification des vulnérabilités
echo -e "${YELLOW}Configuration du script de vérification des vulnérabilités...${NC}"
cat > check-vulnerabilities.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification des vulnérabilités ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Installer snyk si nécessaire
if ! command -v snyk &> /dev/null; then
    echo -e "${YELLOW}Installation de snyk...${NC}"
    npm install -g snyk
fi

# Vérifier les vulnérabilités
echo -e "${YELLOW}Vérification des vulnérabilités...${NC}"
snyk test

# Vérifier les vulnérabilités de l'application
echo -e "${YELLOW}Vérification des vulnérabilités de l'application...${NC}"
snyk monitor

echo -e "${GREEN}✓ Vérification des vulnérabilités terminée${NC}"
EOL

# Rendre les scripts exécutables
chmod +x check-dependencies.sh check-secrets.sh check-permissions.sh check-vulnerabilities.sh

echo -e "${GREEN}✓ Scripts de sécurité configurés avec succès${NC}" 