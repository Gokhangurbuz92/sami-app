import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

export interface Youth {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const youthService = {
  // Créer un nouveau jeune
  async createYouth(youth: Omit<Youth, 'id' | 'createdAt' | 'updatedAt'>): Promise<Youth> {
    const youthRef = await addDoc(collection(db, 'youth'), {
      ...youth,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newYouth = {
      id: youthRef.id,
      ...youth,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Créer une notification pour le nouveau jeune
    await notificationService.createYouthNotification(
      youth.createdBy,
      youthRef.id,
      'Nouveau jeune',
      `Un nouveau jeune "${youth.firstName} ${youth.lastName}" a été ajouté`
    );

    return newYouth;
  },

  // Mettre à jour un jeune
  async updateYouth(id: string, youth: Partial<Youth>): Promise<void> {
    const youthRef = doc(db, 'youth', id);
    await updateDoc(youthRef, {
      ...youth,
      updatedAt: new Date()
    });

    // Créer une notification pour la mise à jour du jeune
    if (youth.firstName || youth.lastName) {
      await notificationService.createYouthNotification(
        youth.createdBy || '',
        id,
        'Jeune mis à jour',
        `Les informations de "${youth.firstName} ${youth.lastName}" ont été mises à jour`
      );
    }
  },

  // Supprimer un jeune
  async deleteYouth(id: string): Promise<void> {
    const youthRef = doc(db, 'youth', id);
    await deleteDoc(youthRef);
  },

  // Récupérer un jeune par son ID
  async getYouthById(id: string): Promise<Youth | null> {
    const youthRef = doc(db, 'youth', id);
    const youthDoc = await getDoc(youthRef);

    if (youthDoc.exists()) {
      return {
        id: youthDoc.id,
        ...youthDoc.data(),
        createdAt: youthDoc.data().createdAt.toDate(),
        updatedAt: youthDoc.data().updatedAt.toDate()
      } as Youth;
    }
    return null;
  },

  // Rechercher des jeunes
  async searchYouth(searchTerm: string, userId: string): Promise<Youth[]> {
    const youthRef = collection(db, 'youth');
    const q = query(youthRef, where('createdBy', '==', userId), orderBy('lastName'));

    const querySnapshot = await getDocs(q);
    const youth = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Youth[];

    // Filtrer les résultats en fonction du terme de recherche
    return youth.filter((y) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        y.firstName.toLowerCase().includes(searchLower) ||
        y.lastName.toLowerCase().includes(searchLower)
      );
    });
  },

  // Récupérer tous les jeunes d'un utilisateur
  async getYouthByUser(userId: string): Promise<Youth[]> {
    const youthRef = collection(db, 'youth');
    const q = query(youthRef, where('createdBy', '==', userId), orderBy('lastName'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Youth[];
  },

  // Écouter les jeunes en temps réel
  subscribeToYouth(userId: string, callback: (youth: Youth[]) => void) {
    const youthRef = collection(db, 'youth');
    const q = query(youthRef, where('createdBy', '==', userId), orderBy('lastName'));

    return onSnapshot(q, (snapshot) => {
      const youth = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Youth[];
      callback(youth);
    });
  }
};
