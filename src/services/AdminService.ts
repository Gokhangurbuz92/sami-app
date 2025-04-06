import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * Vérifie si l'utilisateur actuel est un administrateur
 * @returns {Promise<boolean>} True si l'utilisateur est administrateur
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    // Si l'utilisateur n'est pas connecté, il n'est pas admin
    if (!user) {
      return false;
    }
    
    const db = getFirestore();
    
    // Vérifier d'abord dans la collection 'users'
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data()?.isAdmin === true) {
      return true;
    }
    
    // Vérifier ensuite dans la collection 'admins' si elle existe
    const adminRef = doc(db, 'admins', user.uid);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      return true;
    }
    
    // Si l'utilisateur n'est pas trouvé comme admin, retourner false
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions admin:', error);
    return false;
  }
};

/**
 * Liste des emails autorisés pour le rôle administrateur
 * Note: Dans une application de production, cette liste devrait être stockée dans Firestore
 * avec des règles de sécurité appropriées
 */
export const ADMIN_EMAILS = [
  'sami.admin@strasbourg.eu',
  'gokhan.gurbuz@gmail.com'
];

/**
 * Vérifie si l'email est dans la liste des administrateurs
 * Utile lors de l'inscription pour attribuer automatiquement les droits
 * @param email L'email à vérifier
 * @returns {boolean} True si l'email est dans la liste des admins
 */
export const isEmailInAdminList = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}; 