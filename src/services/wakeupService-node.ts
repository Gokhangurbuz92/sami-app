// Service de gestion des réveils adapté pour l'exécution CLI
// Ce fichier est indépendant de Vite et peut être utilisé dans des scripts Node

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase-node';
import { Appointment } from '../types/firebase';
import { sendMessage as sendChatMessage, Message } from './chatService';

interface WakeupData {
  userId: string;
  appointmentId: string;
  timestamp?: Date;
  type: 'medical' | 'school';
  details: string;
}

// Interface pour le message
interface MessageData {
  content: string;
  senderId: string;
  chatId: string;
  type: 'system' | 'user' | 'assistant';
  timestamp?: Timestamp;
  attachments?: string[];
}

// Fonction pour envoyer un message dans le système
export async function sendMessage(message: MessageData): Promise<{ id: string } & MessageData> {
  try {
    console.log(`[WAKEUP] Envoi d'un message au groupe ${message.chatId}:`);
    console.log(`[WAKEUP] Contenu: ${message.content}`);
    
    // Enregistrer le message dans Firestore
    const messageRef = await addDoc(collection(db, "messages"), {
      ...message,
      timestamp: Timestamp.now()
    });
    
    console.log(`[WAKEUP] Message enregistré avec l'ID: ${messageRef.id}`);
    return { id: messageRef.id, ...message };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
}

// Fonction principale de vérification des réveils
export const checkWakeupList = async (): Promise<void> => {
  try {
    const now = new Date();
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('start', '>=', Timestamp.fromDate(now)),
      where('start', '<=', Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)))
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        start: data.start.toDate(),
        end: data.end.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Appointment);
    });

    console.log('Appointments found:', appointments.length);
    
    // Traiter les rendez-vous trouvés
    for (const appointment of appointments) {
      const message: Message = {
        content: `🔔 Rappel: ${appointment.title} - ${appointment.description}`,
        senderId: 'system',
        chatId: 'professionals',
        type: 'system'
      };

      await sendChatMessage(message);
      console.log('Message envoyé pour le rendez-vous:', appointment.id);
    }
  } catch (error) {
    console.error('Error checking wakeup list:', error);
    throw error;
  }
}; 