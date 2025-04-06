import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../config/firebase';
import { userService, User as FirestoreUser } from '../services/userService';

interface User extends FirebaseUser {
  // Propriétés supplémentaires si nécessaire
}

// Définition des permissions en fonction des rôles
export interface RolePermissions {
  canAccessDashboard: boolean;
  canAccessYouths: boolean;
  canAccessReferents: boolean;
  canAccessMessaging: boolean;
  canAccessMessagingWithYouths: boolean;
  canAccessMessagingWithReferents: boolean;
  canAccessUserManagement: boolean;
  canAccessNotes: boolean;
  canAccessAppointments: boolean;
  canAccessNotifications: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: FirestoreUser['role']
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  loading: boolean;
  error: string | null;
  userRole: FirestoreUser['role'] | null;
  userPermissions: RolePermissions | null;
  isAdmin: boolean;
  isReferent: boolean;
  isJeune: boolean;
  checkPermission: (permission: keyof RolePermissions) => boolean;
  checkEmailVerification: () => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  canAccessDashboard: false,
  canAccessYouths: false,
  canAccessReferents: false,
  canAccessMessaging: false,
  canAccessMessagingWithYouths: false,
  canAccessMessagingWithReferents: false,
  canAccessUserManagement: false,
  canAccessNotes: false,
  canAccessAppointments: false,
  canAccessNotifications: false
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  signUp: async () => {
    throw new Error('Not implemented');
  },
  signIn: async () => {
    throw new Error('Not implemented');
  },
  logout: async () => {
    throw new Error('Not implemented');
  },
  resetPassword: async () => {
    throw new Error('Not implemented');
  },
  signInWithGoogle: async () => {
    throw new Error('Not implemented');
  },
  loading: true,
  error: null,
  userRole: null,
  userPermissions: null,
  isAdmin: false,
  isReferent: false,
  isJeune: false,
  checkPermission: () => false,
  checkEmailVerification: async () => false,
  sendVerificationEmail: async () => {
    throw new Error('Not implemented');
  }
});

const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<FirestoreUser['role'] | null>(null);
  const [userPermissions, setUserPermissions] = useState<RolePermissions | null>(null);
  const { t } = useTranslation();

  // Calcul des permissions en fonction du rôle
  const computePermissions = (role: FirestoreUser['role'] | null): RolePermissions => {
    if (!role) return DEFAULT_PERMISSIONS;

    switch (role) {
      case 'jeune':
        return {
          canAccessDashboard: true,
          canAccessYouths: false,
          canAccessReferents: false,
          canAccessMessaging: true,
          canAccessMessagingWithYouths: false,
          canAccessMessagingWithReferents: true,
          canAccessUserManagement: false,
          canAccessNotes: true,
          canAccessAppointments: true,
          canAccessNotifications: true
        };
      case 'referent':
      case 'coreferent':
        return {
          canAccessDashboard: true,
          canAccessYouths: true,
          canAccessReferents: false,
          canAccessMessaging: true,
          canAccessMessagingWithYouths: true,
          canAccessMessagingWithReferents: false,
          canAccessUserManagement: false,
          canAccessNotes: true,
          canAccessAppointments: true,
          canAccessNotifications: true
        };
      case 'admin':
        return {
          canAccessDashboard: true,
          canAccessYouths: true,
          canAccessReferents: true,
          canAccessMessaging: false,
          canAccessMessagingWithYouths: false,
          canAccessMessagingWithReferents: false,
          canAccessUserManagement: true,
          canAccessNotes: true,
          canAccessAppointments: true,
          canAccessNotifications: true
        };
      default:
        return DEFAULT_PERMISSIONS;
    }
  };

  // Fonction pour vérifier les permissions
  const checkPermission = (permission: keyof RolePermissions): boolean => {
    if (!userPermissions) return false;
    return userPermissions[permission];
  };

  // Boolean helpers pour vérifier le rôle facilement
  const isAdmin = userRole === 'admin';
  const isReferent = userRole === 'referent' || userRole === 'coreferent';
  const isJeune = userRole === 'jeune';

  useEffect(() => {
    // Observer les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user as User | null);

      if (user) {
        try {
          // Récupérer les informations du profil utilisateur depuis Firestore
          const userData = await userService.getUserById(user.uid);
          if (userData) {
            setUserRole(userData.role);
            setUserPermissions(computePermissions(userData.role));
          } else {
            setUserRole(null);
            setUserPermissions(DEFAULT_PERMISSIONS);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du rôle:', error);
          setUserRole(null);
          setUserPermissions(DEFAULT_PERMISSIONS);
        }
      } else {
        setUserRole(null);
        setUserPermissions(DEFAULT_PERMISSIONS);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: FirestoreUser['role']
  ): Promise<User> => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user as User;
      
      // Envoyer l'email de vérification
      await sendEmailVerification(user);

      await userService.createUser({
        uid: user.uid,
        email: user.email || email,
        displayName,
        role
      });

      setUserRole(role);
      setUserPermissions(computePermissions(role));

      return user;
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.signUpFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user as User;

      // Vérifier si l'email est vérifié
      if (!user.emailVerified) {
        const errorMessage = t('auth.emailNotVerified');
        setError(errorMessage);
        await signOut(auth);
        throw new Error(errorMessage);
      }

      // Récupérer les informations du profil utilisateur depuis Firestore
      const userData = await userService.getUserById(user.uid);
      if (userData) {
        setUserRole(userData.role);
        setUserPermissions(computePermissions(userData.role));
      }

      return user;
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.signInFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user as User;

      // Vérifier si l'utilisateur existe déjà dans Firestore
      const existingUser = await userService.getUserById(user.uid);

      // Si l'utilisateur n'existe pas, créer un document utilisateur
      if (!existingUser) {
        const defaultRole: FirestoreUser['role'] = 'jeune';
        await userService.createUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Utilisateur Google',
          role: defaultRole
        });
        setUserRole(defaultRole);
        setUserPermissions(computePermissions(defaultRole));
      } else {
        setUserRole(existingUser.role);
        setUserPermissions(computePermissions(existingUser.role));
      }

      return user;
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.googleSignInFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      setUserRole(null);
      setUserPermissions(DEFAULT_PERMISSIONS);
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.logoutFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.resetPasswordFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  // Fonction pour vérifier si l'email est vérifié
  const checkEmailVerification = async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      // Recharger l'utilisateur pour obtenir le statut le plus récent
      await reload(currentUser);
      return currentUser.emailVerified;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  };

  // Fonction pour renvoyer l'email de vérification
  const sendVerificationEmail = async (): Promise<void> => {
    if (!currentUser) {
      throw new Error(t('auth.userNotLoggedIn'));
    }
    
    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      const err = error as Error;
      const errorMessage = t('auth.sendVerificationEmailFailed', { message: err.message });
      setError(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    signUp,
    signIn,
    logout,
    resetPassword,
    signInWithGoogle,
    loading,
    error,
    userRole,
    userPermissions,
    isAdmin,
    isReferent,
    isJeune,
    checkPermission,
    checkEmailVerification,
    sendVerificationEmail
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
