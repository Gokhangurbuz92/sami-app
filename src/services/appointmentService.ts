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
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

export interface Appointment {
  id?: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const appointmentService = {
  // Créer un nouveau rendez-vous
  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> {
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newAppointment = {
      id: appointmentRef.id,
      ...appointment,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Créer une notification pour le nouveau rendez-vous
    await notificationService.createAppointmentNotification(
      appointment.createdBy,
      appointmentRef.id,
      'Nouveau rendez-vous',
      `Un nouveau rendez-vous "${appointment.title}" a été créé pour le ${appointment.start.toLocaleDateString()}`
    );

    return newAppointment;
  },

  // Mettre à jour un rendez-vous
  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, {
      ...appointment,
      updatedAt: new Date()
    });

    // Créer une notification pour la mise à jour du rendez-vous
    if (appointment.status) {
      const statusMessages = {
        completed: 'a été marqué comme terminé',
        cancelled: 'a été annulé'
      };

      if (statusMessages[appointment.status]) {
        await notificationService.createAppointmentNotification(
          appointment.createdBy || '',
          id,
          'Mise à jour du rendez-vous',
          `Le rendez-vous "${appointment.title}" ${statusMessages[appointment.status]}`
        );
      }
    }
  },

  // Supprimer un rendez-vous
  async deleteAppointment(id: string): Promise<void> {
    const appointmentRef = doc(db, 'appointments', id);
    await deleteDoc(appointmentRef);
  },

  // Récupérer les rendez-vous d'un utilisateur
  async getAppointments(userId: string): Promise<Appointment[]> {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('createdBy', '==', userId), orderBy('start', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Appointment[];
  },

  // Écouter les rendez-vous en temps réel
  subscribeToAppointments(userId: string, callback: (appointments: Appointment[]) => void) {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('createdBy', '==', userId), orderBy('start', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Appointment[];
      callback(appointments);
    });
  }
};
