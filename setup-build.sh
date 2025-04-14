#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des scripts de build ===${NC}"

# Configurer le fichier package.json
echo -e "${YELLOW}Configuration du fichier package.json...${NC}"
cat > package.json << 'EOL'
{
  "name": "sami-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "preview": "vite preview",
    "deploy": "firebase deploy",
    "android": "npx cap sync android && npx cap open android",
    "ios": "npx cap sync ios && npx cap open ios",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@capacitor/android": "^5.0.0",
    "@capacitor/core": "^5.0.0",
    "@capacitor/ios": "^5.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@firebase/auth": "^0.20.0",
    "@firebase/firestore": "^3.0.0",
    "@firebase/messaging": "^1.0.0",
    "@firebase/storage": "^1.0.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.13.0",
    "@sentry/react": "^7.80.0",
    "firebase": "^10.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0"
  },
  "devDependencies": {
    "@sentry/webpack-plugin": "^2.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.39.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "prettier": "^2.8.8",
    "typescript": "^5.0.0",
    "vite": "^4.3.0",
    "vitest": "^0.30.0"
  }
}
EOL

# Configurer le fichier tsconfig.json
echo -e "${YELLOW}Configuration du fichier tsconfig.json...${NC}"
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Configurer le fichier tsconfig.node.json
echo -e "${YELLOW}Configuration du fichier tsconfig.node.json...${NC}"
cat > tsconfig.node.json << 'EOL'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# Configurer le fichier vite.config.ts
echo -e "${YELLOW}Configuration du fichier vite.config.ts...${NC}"
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
});
EOL

# Configurer le fichier .eslintrc.json
echo -e "${YELLOW}Configuration du fichier .eslintrc.json...${NC}"
cat > .eslintrc.json << 'EOL'
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh"],
  "root": true,
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}
EOL

# Configurer le fichier .prettierrc
echo -e "${YELLOW}Configuration du fichier .prettierrc...${NC}"
cat > .prettierrc << 'EOL'
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOL

echo -e "${GREEN}✓ Scripts de build configurés avec succès${NC}" 