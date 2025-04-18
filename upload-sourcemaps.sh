#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérification des arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <platform> <environment>"
    echo "Platform: web|android|ios"
    echo "Environment: development|production"
    exit 1
fi

PLATFORM=$1
ENVIRONMENT=$2
VERSION=$(node -p "require('./package.json').version")
RELEASE="${VERSION}-${PLATFORM}-${ENVIRONMENT}"

# Chargement des variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Fonction pour uploader les sourcemaps
upload_sourcemaps() {
    local platform=$1
    local sourcemap_path=$2
    
    echo "Uploading sourcemaps for ${platform}..."
    
    npx @sentry/cli sourcemaps upload \
        --auth-token $SENTRY_AUTH_TOKEN \
        --org $SENTRY_ORG \
        --project $SENTRY_PROJECT \
        --release $RELEASE \
        --url-prefix '~' \
        $sourcemap_path
}

# Upload selon la plateforme
case $PLATFORM in
    "web")
        upload_sourcemaps "web" "dist/assets"
        ;;
    "android")
        upload_sourcemaps "android" "android/app/build/intermediates/sourcemaps/release"
        ;;
    "ios")
        upload_sourcemaps "ios" "ios/App/App/public/assets"
        ;;
    *)
        echo "Platform non supportée: $PLATFORM"
        exit 1
        ;;
esac

echo "✅ Sourcemaps uploadés avec succès pour $PLATFORM ($ENVIRONMENT)"

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
sentry-cli releases deploys "$RELEASE" new -e "$ENVIRONMENT"

echo -e "\n${GREEN}🎉 Upload des sourcemaps terminé avec succès !${NC}"
echo -e "${YELLOW}📝 Résumé :${NC}"
echo -e "- Release : $RELEASE"
echo -e "- Environnement : $ENVIRONMENT"
if [ ! -z "$COMMIT" ]; then
    echo -e "- Commit : $COMMIT"
fi 