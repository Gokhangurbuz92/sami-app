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
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ApiResponse, ErrorResponse } from '../types/global';
import { User, Referent, Youth } from '../types';

type UserRole = 'admin' | 'referent' | 'jeune';

interface FirestoreUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const convertFirestoreTimestamps = (data: DocumentData): Partial<User> => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

export const userService = {
  /**
   * Crée un nouvel utilisateur dans Firestore
   */
  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    try {
      const { id } = userData;

      if (!userData.role) {
        return {
          data: null,
          error: 'Le champ role est obligatoire',
          status: 400
        };
      }

      const userDataToSave: Partial<FirestoreUser> = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      switch (userData.role) {
        case 'jeune':
          userDataToSave.assignedReferents = userData.assignedReferents || [];
          delete userDataToSave.assignedYouths;
          break;
        case 'referent':
          userDataToSave.assignedYouths = userData.assignedYouths || [];
          delete userDataToSave.assignedReferents;
          break;
        case 'admin':
          delete userDataToSave.assignedReferents;
          delete userDataToSave.assignedYouths;
          break;
      }

      await setDoc(doc(db, 'users', id), userDataToSave);

      return {
        data: {
          ...userDataToSave,
          createdAt: new Date(),
          updatedAt: new Date()
        } as User,
        error: null,
        status: 201
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      
      if (!userDoc.exists()) {
        return {
          data: null,
          error: `L'utilisateur avec l'ID ${id} n'existe pas`,
          status: 404
        };
      }

      const userData = userDoc.data() as FirestoreUser;
      
      return {
        data: {
          ...userData,
          id: userDoc.id,
          createdAt: userData.createdAt.toDate(),
          updatedAt: userData.updatedAt.toDate()
        } as User,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Met à jour un utilisateur
   */
  async updateUser(
    id: string,
    userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<boolean>> {
    try {
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          data: null,
          error: `L'utilisateur avec l'ID ${id} n'existe pas`,
          status: 404
        };
      }

      const updateData = {
        ...userData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);

      return {
        data: true,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    try {
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          data: null,
          error: `L'utilisateur avec l'ID ${id} n'existe pas`,
          status: 404
        };
      }

      await deleteDoc(userRef);

      return {
        data: true,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Récupère tous les utilisateurs par rôle
   */
  async getUsersByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertFirestoreTimestamps(doc.data())
      })) as User[];

      return {
        data: users,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Récupère tous les jeunes associés à un référent
   */
  async getYouthsByReferentId(referentId: string): Promise<ApiResponse<Youth[]>> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'jeune'),
        where('assignedReferents', 'array-contains', referentId)
      );

      const querySnapshot = await getDocs(q);
      const youths = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertFirestoreTimestamps(doc.data())
      })) as Youth[];

      return {
        data: youths,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Récupère tous les référents associés à un jeune
   */
  async getReferentsByYouthId(youthId: string): Promise<ApiResponse<Referent[]>> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'referent'),
        where('assignedYouths', 'array-contains', youthId)
      );

      const querySnapshot = await getDocs(q);
      const referents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertFirestoreTimestamps(doc.data())
      })) as Referent[];

      return {
        data: referents,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Récupère tous les référents
   */
  async fetchReferents(): Promise<ApiResponse<Referent[]>> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'referent'));
      const querySnapshot = await getDocs(q);
      
      const referents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertFirestoreTimestamps(doc.data())
      })) as Referent[];

      return {
        data: referents,
        error: null,
        status: 200
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }
  return {
    message: 'Une erreur inconnue est survenue',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
};
