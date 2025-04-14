import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * LazyLoad - Utilitaire pour charger les composants de manière paresseuse
 * @param importFunction - Fonction d'importation dynamique
 * @returns Composant chargé dynamiquement avec Suspense
 */
export function LazyLoad<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(importFunction);

  return (props: React.ComponentProps<T>) => (
    <Suspense 
      fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Utilitaire pour précharger un composant à l'avance
 * @param importFunction - Fonction d'importation dynamique
 */
export function preloadComponent<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
): void {
  importFunction();
} 