// Service de gestion des réveils adapté pour l'exécution CLI
// Ce fichier est indépendant de Vite et peut être utilisé dans des scripts Node

import { collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase-node';

interface Appointment {
  userId: string;
  date: Timestamp;
  type: 'medical' | 'school';
  details: string;
  time?: string;
}

// Interface pour le message
interface MessageData {
  content: string;
  senderId: string;
  chatId: string;
  type: 'system' | 'user' | 'assistant';
  timestamp?: any;
  attachments?: string[];
}

// Fonction pour envoyer un message dans le système
export async function sendMessage(message: MessageData): Promise<any> {
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
export const checkWakeupList = async () => {
  try {
    console.log("[WAKEUP] Démarrage de la vérification des réveils");
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`[WAKEUP] Recherche des rendez-vous entre ${today.toISOString()} et ${tomorrow.toISOString()}`);

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

    console.log("[WAKEUP] Exécution des requêtes Firestore");
    
    const [medicalSnap, schoolSnap] = await Promise.all([
      getDocs(medicalQuery),
      getDocs(schoolQuery)
    ]);

    const appointments: Appointment[] = [
      ...medicalSnap.docs.map(doc => ({ ...doc.data() } as Appointment)),
      ...schoolSnap.docs.map(doc => ({ ...doc.data() } as Appointment))
    ];

    console.log(`[WAKEUP] ${appointments.length} rendez-vous trouvés pour aujourd'hui`);

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
      
      console.log("[WAKEUP] Notification envoyée au groupe de professionnels");
      return true;
    } else {
      console.log("[WAKEUP] Aucun rendez-vous trouvé pour aujourd'hui, aucune notification envoyée");
      return false;
    }
  } catch (error) {
    console.error('[WAKEUP] Erreur lors de la vérification des réveils:', error);
    throw error;
  }
}; 