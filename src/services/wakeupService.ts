import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { sendMessage } from './chatService';

interface Appointment {
  userId: string;
  date: Timestamp;
  type: 'medical' | 'school';
  details: string;
}

export const checkWakeupList = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Requête pour les rendez-vous médicaux
    const medicalQuery = query(
      collection(db, 'appointments'),
      where('date', '>=', today),
      where('date', '<', tomorrow),
      where('type', '==', 'medical')
    );

    // Requête pour les cours avant 10h
    const schoolQuery = query(
      collection(db, 'appointments'),
      where('date', '>=', today),
      where('date', '<', tomorrow),
      where('type', '==', 'school'),
      where('time', '<', '10:00')
    );

    const [medicalSnap, schoolSnap] = await Promise.all([
      getDocs(medicalQuery),
      getDocs(schoolQuery)
    ]);

    const appointments: Appointment[] = [
      ...medicalSnap.docs.map(doc => doc.data() as Appointment),
      ...schoolSnap.docs.map(doc => doc.data() as Appointment)
    ];

    if (appointments.length > 0) {
      const message = `🔔 Liste de réveil du ${today.toLocaleDateString()}:\n\n` +
        appointments.map(app => 
          `• ${app.details} (${app.type === 'medical' ? 'Rendez-vous médical' : 'École'})`
        ).join('\n');

      await sendMessage({
        content: message,
        senderId: 'system',
        chatId: 'professionals',
        type: 'system'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des réveils:', error);
    throw error;
  }
}; 