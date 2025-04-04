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

export interface Note {
  id?: string;
  title: string;
  content: string;
  category: 'general' | 'medical' | 'social' | 'education' | 'other';
  priority: 'high' | 'medium' | 'low';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  youthId?: string; // ID du jeune associé à la note
  tags: string[];
}

export const noteService = {
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const noteRef = await addDoc(collection(db, 'notes'), {
      ...note,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newNote = {
      id: noteRef.id,
      ...note,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await notificationService.createNoteNotification(
      note.createdBy,
      noteRef.id,
      'Nouvelle note',
      `Une nouvelle note "${note.title}" a été créée`
    );

    return newNote;
  },

  async updateNote(id: string, note: Partial<Note>): Promise<void> {
    const noteRef = doc(db, 'notes', id);
    await updateDoc(noteRef, {
      ...note,
      updatedAt: new Date()
    });

    if (note.title || note.content) {
      await notificationService.createNoteNotification(
        note.createdBy || '',
        id,
        'Note mise à jour',
        `La note "${note.title}" a été mise à jour`
      );
    }
  },

  async deleteNote(id: string): Promise<void> {
    const noteRef = doc(db, 'notes', id);
    await deleteDoc(noteRef);
  },

  async getNotes(userId: string, youthId?: string): Promise<Note[]> {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('createdBy', '==', userId),
      ...(youthId ? [where('youthId', '==', youthId)] : []),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Note[];
  },

  async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Note[];

    return notes.filter((note) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });
  },

  subscribeToNotes(userId: string, youthId?: string, callback: (notes: Note[]) => void) {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('createdBy', '==', userId),
      ...(youthId ? [where('youthId', '==', youthId)] : []),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Note[];
      callback(notes);
    });
  }
};
