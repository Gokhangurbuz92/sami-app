#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour afficher l'usage
show_usage() {
    echo "Usage: $0 [--platform <web|android|ios>] [--env <development|production>]"
    echo "Options:"
    echo "  --platform    Plateforme cible (web, android, ios)"
    echo "  --env         Environnement (development, production)"
    exit 1
}

# Traitement des arguments
PLATFORM=""
ENV="production"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --platform) PLATFORM="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) show_usage ;;
    esac
    shift
done

if [ -z "$PLATFORM" ]; then
    show_usage
fi

# Charger les variables d'environnement
if [ -f ".env" ]; then
    source .env
else
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    exit 1
fi

# Vérifier les variables Sentry
if [ -z "$SENTRY_AUTH_TOKEN" ] || [ -z "$SENTRY_ORG" ] || [ -z "$SENTRY_PROJECT" ]; then
    echo -e "${RED}❌ Variables Sentry manquantes dans .env${NC}"
    echo "SENTRY_AUTH_TOKEN, SENTRY_ORG et SENTRY_PROJECT sont requis"
    exit 1
fi

# Vérifier si sentry-cli est installé
if ! command -v sentry-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️ Installation de sentry-cli...${NC}"
    npm install -g @sentry/cli
fi

# Variables
VERSION=$(node -p "require('./package.json').version")
RELEASE="sami-app@$VERSION-$ENV"

# Définir le dossier source selon la plateforme
case $PLATFORM in
    "web")
        SOURCE_DIR="./dist"
        ;;
    "android")
        SOURCE_DIR="./android/app/build/intermediates/sourcemaps/release"
        ;;
    "ios")
        SOURCE_DIR="./ios/App/App/public/build"
        ;;
    *)
        echo -e "${RED}❌ Plateforme non supportée : $PLATFORM${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}📦 Configuration de l'upload :${NC}"
echo -e "- Plateforme : $PLATFORM"
echo -e "- Environnement : $ENV"
echo -e "- Version : $VERSION"
echo -e "- Release : $RELEASE"
echo -e "- Dossier source : $SOURCE_DIR"

# Créer la release
echo -e "\n${GREEN}🚀 Création de la release $RELEASE...${NC}"
sentry-cli releases new "$RELEASE"

# Upload des sourcemaps
echo -e "\n${GREEN}📝 Upload des sourcemaps...${NC}"
sentry-cli releases files "$RELEASE" upload-sourcemaps "$SOURCE_DIR" \
    --ext map \
    --ext js \
    --ext ts \
    --ext tsx \
    --url-prefix "~/" \
    --rewrite

# Ajouter des informations sur le commit (si Git est disponible)
if command -v git &> /dev/null; then
    echo -e "\n${GREEN}📎 Association des commits...${NC}"
    COMMIT=$(git rev-parse HEAD)
    sentry-cli releases set-commits "$RELEASE" --auto
fi

# Finaliser la release
echo -e "\n${GREEN}✅ Finalisation de la release...${NC}"
sentry-cli releases finalize "$RELEASE"

# Déployer la release
echo -e "\n${GREEN}🚀 Déploiement de la release...${NC}"
sentry-cli releases deploys "$RELEASE" new -e "$ENV"

echo -e "\n${GREEN}🎉 Upload des sourcemaps terminé avec succès !${NC}"
echo -e "${YELLOW}📝 Résumé :${NC}"
echo -e "- Release : $RELEASE"
echo -e "- Environnement : $ENV"
echo -e "- Dossier source : $SOURCE_DIR"
if [ ! -z "$COMMIT" ]; then
    echo -e "- Commit : $COMMIT"
fi 