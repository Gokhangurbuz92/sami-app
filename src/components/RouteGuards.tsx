import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RolePermissions } from '../contexts/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('jeune' | 'referent' | 'coreferent' | 'admin')[];
  requiredPermission?: keyof RolePermissions;
  redirectTo?: string;
}

/**
 * Composant qui protège les routes en fonction des rôles autorisés
 */
export function RoleRoute({
  children,
  allowedRoles = [],
  requiredPermission,
  redirectTo = '/'
}: RoleRouteProps) {
  const { currentUser, userRole, checkPermission, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si aucun rôle n'est spécifié mais que la permission est requise
  if (allowedRoles.length === 0 && requiredPermission) {
    if (!checkPermission(requiredPermission)) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{children}</>;
  }

  // Si des rôles sont spécifiés, vérifier le rôle de l'utilisateur
  if (allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Route accessible uniquement aux administrateurs
 */
export function AdminRoute({
  children,
  redirectTo = '/'
}: Omit<RoleRouteProps, 'allowedRoles' | 'requiredPermission'>) {
  return (
    <RoleRoute allowedRoles={['admin']} redirectTo={redirectTo}>
      {children}
    </RoleRoute>
  );
}

/**
 * Route accessible uniquement aux référents et co-référents
 */
export function ReferentRoute({
  children,
  redirectTo = '/'
}: Omit<RoleRouteProps, 'allowedRoles' | 'requiredPermission'>) {
  return (
    <RoleRoute allowedRoles={['referent', 'coreferent']} redirectTo={redirectTo}>
      {children}
    </RoleRoute>
  );
}

/**
 * Route accessible uniquement aux jeunes
 */
export function JeuneRoute({
  children,
  redirectTo = '/'
}: Omit<RoleRouteProps, 'allowedRoles' | 'requiredPermission'>) {
  return (
    <RoleRoute allowedRoles={['jeune']} redirectTo={redirectTo}>
      {children}
    </RoleRoute>
  );
}

/**
 * Route accessible selon une permission spécifique
 */
export function PermissionRoute({
  children,
  requiredPermission,
  redirectTo = '/'
}: Omit<RoleRouteProps, 'allowedRoles'> & { requiredPermission: keyof RolePermissions }) {
  return (
    <RoleRoute requiredPermission={requiredPermission} redirectTo={redirectTo}>
      {children}
    </RoleRoute>
  );
}

// Garde de route pour vérifier si l'email est vérifié
export const EmailVerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/email-verification" replace />;
  }

  return <>{children}</>;
};
