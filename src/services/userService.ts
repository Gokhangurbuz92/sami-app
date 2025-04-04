import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'jeune' | 'referent' | 'coreferent' | 'admin';
  assignedReferents?: string[]; // Si le rôle est "jeune"
  assignedYouths?: string[]; // Si le rôle est "referent" ou "coreferent"
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const userService = {
  /**
   * Crée un nouvel utilisateur dans Firestore
   */
  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const { uid } = userData;

    // Validation de base
    if (!userData.role) {
      throw new Error('Le champ role est obligatoire');
    }

    // Préparation des données en fonction du rôle
    const userDataToSave: any = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Pour s'assurer que les champs appropriés existent selon le rôle
    if (userData.role === 'jeune') {
      userDataToSave.assignedReferents = userData.assignedReferents || [];
      // Supprimer le champ assignedYouths si présent
      delete userDataToSave.assignedYouths;
    } else if (userData.role === 'referent' || userData.role === 'coreferent') {
      userDataToSave.assignedYouths = userData.assignedYouths || [];
      // Supprimer le champ assignedReferents si présent
      delete userDataToSave.assignedReferents;
    } else {
      // Pour le rôle admin, supprimer les deux champs s'ils sont présents
      delete userDataToSave.assignedReferents;
      delete userDataToSave.assignedYouths;
    }

    await setDoc(doc(db, 'users', uid), userDataToSave);

    return {
      ...userDataToSave,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  },

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return null;
  },

  /**
   * Met à jour un utilisateur
   */
  async updateUser(
    uid: string,
    userData: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const userRef = doc(db, 'users', uid);

    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error(`L'utilisateur avec l'ID ${uid} n'existe pas`);
    }

    // Préparer les données à mettre à jour
    const userDataToUpdate: any = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, userDataToUpdate);
  },

  /**
   * Supprime un utilisateur
   */
  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  },

  /**
   * Récupère tous les utilisateurs par rôle
   */
  async getUsersByRole(role: User['role']): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as User);
  },

  /**
   * Récupère tous les jeunes associés à un référent
   */
  async getYouthsByReferentId(referentId: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', 'jeune'),
      where('assignedReferents', 'array-contains', referentId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as User);
  },

  /**
   * Récupère tous les référents associés à un jeune
   */
  async getReferentsByYouthId(youthId: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', 'in', ['referent', 'coreferent']),
      where('assignedYouths', 'array-contains', youthId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as User);
  },

  /**
   * Ajoute un référent à un jeune
   */
  async assignReferentToYouth(youthId: string, referentId: string): Promise<void> {
    // Mettre à jour le jeune
    const youthRef = doc(db, 'users', youthId);
    const youthDoc = await getDoc(youthRef);

    if (!youthDoc.exists() || youthDoc.data().role !== 'jeune') {
      throw new Error(`L'utilisateur ${youthId} n'existe pas ou n'est pas un jeune`);
    }

    const userData = youthDoc.data() as User;
    const assignedReferents = [...(userData.assignedReferents || [])];

    if (!assignedReferents.includes(referentId)) {
      assignedReferents.push(referentId);
      await updateDoc(youthRef, {
        assignedReferents,
        updatedAt: serverTimestamp()
      });
    }

    // Mettre à jour le référent
    const referentRef = doc(db, 'users', referentId);
    const referentDoc = await getDoc(referentRef);

    if (!referentDoc.exists() || !['referent', 'coreferent'].includes(referentDoc.data().role)) {
      throw new Error(`L'utilisateur ${referentId} n'existe pas ou n'est pas un référent`);
    }

    const referentData = referentDoc.data() as User;
    const assignedYouths = [...(referentData.assignedYouths || [])];

    if (!assignedYouths.includes(youthId)) {
      assignedYouths.push(youthId);
      await updateDoc(referentRef, {
        assignedYouths,
        updatedAt: serverTimestamp()
      });
    }
  },

  /**
   * Supprime l'association entre un référent et un jeune
   */
  async removeReferentFromYouth(youthId: string, referentId: string): Promise<void> {
    // Mettre à jour le jeune
    const youthRef = doc(db, 'users', youthId);
    const youthDoc = await getDoc(youthRef);

    if (youthDoc.exists() && youthDoc.data().role === 'jeune') {
      const userData = youthDoc.data() as User;
      const assignedReferents = [...(userData.assignedReferents || [])].filter(
        (id) => id !== referentId
      );

      await updateDoc(youthRef, {
        assignedReferents,
        updatedAt: serverTimestamp()
      });
    }

    // Mettre à jour le référent
    const referentRef = doc(db, 'users', referentId);
    const referentDoc = await getDoc(referentRef);

    if (referentDoc.exists() && ['referent', 'coreferent'].includes(referentDoc.data().role)) {
      const referentData = referentDoc.data() as User;
      const assignedYouths = [...(referentData.assignedYouths || [])].filter(
        (id) => id !== youthId
      );

      await updateDoc(referentRef, {
        assignedYouths,
        updatedAt: serverTimestamp()
      });
    }
  }
};
