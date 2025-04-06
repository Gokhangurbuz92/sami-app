import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isCurrentUserAdmin } from '../../services/AdminService';

/**
 * Route protégée qui vérifie si l'utilisateur est administrateur
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 * Affiche un message d'accès refusé si l'utilisateur est connecté mais n'est pas administrateur
 */
const AdminRoute: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // L'utilisateur est connecté, vérifier s'il est admin
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        // L'utilisateur n'est pas connecté
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Pendant le chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (isAdmin === null) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté mais n'est pas administrateur
  if (isAdmin === false) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 2 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Accès Refusé
          </Typography>
          <Typography variant="body1">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            Seuls les administrateurs y ont accès.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Si l'utilisateur est administrateur, afficher les composants enfants
  return <Outlet />;
};

export default AdminRoute; 