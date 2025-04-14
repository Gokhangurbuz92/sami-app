#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de documentation ===${NC}"

# Créer le dossier docs s'il n'existe pas
mkdir -p docs

# Configurer le script de génération de documentation
echo -e "${YELLOW}Configuration du script de génération de documentation...${NC}"
cat > generate-docs.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Génération de la documentation ===${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    npm install
fi

# Installer TypeDoc si nécessaire
if ! command -v typedoc &> /dev/null; then
    echo -e "${YELLOW}Installation de TypeDoc...${NC}"
    npm install -g typedoc
fi

# Générer la documentation
echo -e "${YELLOW}Génération de la documentation TypeScript...${NC}"
typedoc --out docs/api src

# Copier la documentation utilisateur
echo -e "${YELLOW}Copie de la documentation utilisateur...${NC}"
cp -r docs/user/* docs/

# Générer la documentation des composants
echo -e "${YELLOW}Génération de la documentation des composants...${NC}"
npx storybook build -o docs/components

echo -e "${GREEN}✓ Documentation générée avec succès${NC}"
echo -e "${YELLOW}⚠️ La documentation est disponible dans le dossier docs/${NC}"
EOL

# Configurer le script de vérification de documentation
echo -e "${YELLOW}Configuration du script de vérification de documentation...${NC}"
cat > check-docs.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vérification de la documentation ===${NC}"

# Vérifier les fichiers manquants
echo -e "${YELLOW}Vérification des fichiers manquants...${NC}"
if [ ! -f "docs/README.md" ]; then
    echo -e "${RED}❌ docs/README.md manquant${NC}"
fi

if [ ! -f "docs/CONTRIBUTING.md" ]; then
    echo -e "${RED}❌ docs/CONTRIBUTING.md manquant${NC}"
fi

if [ ! -f "docs/CHANGELOG.md" ]; then
    echo -e "${RED}❌ docs/CHANGELOG.md manquant${NC}"
fi

# Vérifier les liens brisés
echo -e "${YELLOW}Vérification des liens brisés...${NC}"
find docs -name "*.md" -exec grep -l "\[.*\]\(.*\)" {} \; | while read file; do
    grep -o "\[.*\]\(.*\)" "$file" | while read link; do
        url=$(echo "$link" | sed -E 's/\[.*\]\((.*)\)/\1/')
        if [[ $url != http* ]]; then
            if [ ! -f "docs/$url" ]; then
                echo -e "${RED}❌ Lien brisé dans $file: $url${NC}"
            fi
        fi
    done
done

echo -e "${GREEN}✓ Vérification de la documentation terminée${NC}"
EOL

# Configurer le script de mise à jour de documentation
echo -e "${YELLOW}Configuration du script de mise à jour de documentation...${NC}"
cat > update-docs.sh << 'EOL'
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Mise à jour de la documentation ===${NC}"

# Mettre à jour la documentation API
echo -e "${YELLOW}Mise à jour de la documentation API...${NC}"
./generate-docs.sh

# Mettre à jour le CHANGELOG
echo -e "${YELLOW}Mise à jour du CHANGELOG...${NC}"
if [ -f "docs/CHANGELOG.md" ]; then
    git log --pretty=format:"%h - %s (%an, %ar)" --since="1 week ago" >> docs/CHANGELOG.md
fi

# Vérifier la documentation
echo -e "${YELLOW}Vérification de la documentation...${NC}"
./check-docs.sh

echo -e "${GREEN}✓ Mise à jour de la documentation terminée${NC}"
EOL

# Rendre les scripts exécutables
chmod +x generate-docs.sh check-docs.sh update-docs.sh

# Créer les fichiers de documentation de base
echo -e "${YELLOW}Création des fichiers de documentation de base...${NC}"

# README.md
cat > docs/README.md << 'EOL'
# Documentation SAMI

## Table des matières
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API](#api)
- [Composants](#composants)
- [Contribuer](#contribuer)

## Installation
Pour installer le projet, suivez les étapes suivantes :

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/sami.git

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Configuration
La configuration du projet se fait via les fichiers `.env`. Voir [Configuration](CONFIGURATION.md) pour plus de détails.

## Utilisation
Pour plus d'informations sur l'utilisation de l'application, consultez le [Guide d'utilisation](USER_GUIDE.md).

## API
La documentation de l'API est disponible [ici](api/README.md).

## Composants
La documentation des composants est disponible [ici](components/README.md).

## Contribuer
Pour contribuer au projet, consultez le [Guide de contribution](CONTRIBUTING.md).
EOL

# CONTRIBUTING.md
cat > docs/CONTRIBUTING.md << 'EOL'
# Guide de contribution

## Processus de contribution
1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Standards de code
- Suivre les conventions de nommage
- Ajouter des commentaires pour le code complexe
- Tester votre code
- Mettre à jour la documentation

## Style de commit
- feat: Nouvelle fonctionnalité
- fix: Correction de bug
- docs: Changements dans la documentation
- style: Formatage, point-virgule manquant, etc.
- refactor: Refactoring du code
- test: Ajout ou modification de tests
- chore: Mise à jour des dépendances, etc.
EOL

# CHANGELOG.md
cat > docs/CHANGELOG.md << 'EOL'
# Journal des modifications

## [Non publié]
### Ajouté
- Scripts de documentation
- Documentation de base

### Modifié
- Structure du projet
- Configuration des scripts

### Corrigé
- Problèmes de configuration
- Erreurs de linting
EOL

echo -e "${GREEN}✓ Scripts de documentation configurés avec succès${NC}" 