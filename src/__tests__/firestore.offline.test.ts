import { initializeFirestore, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { setDoc, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('Firestore Offline', () => {
  let db: any;

  beforeEach(async () => {
    const app = initializeApp({ projectId: 'sami-app' });
    db = initializeFirestore(app, {});
    await enableIndexedDbPersistence(db);
  });

  afterEach(async () => {
    await disableNetwork(db);
  });

  test('synchronise un message offline', async () => {
    await disableNetwork(db);
    
    // Créer un message hors ligne
    const messageRef = doc(db, 'messages', 'msg1');
    await setDoc(messageRef, {
      senderId: 'jeune123',
      recipientId: 'referent123',
      text: 'Message hors ligne',
      createdAt: new Date(),
    });

    // Vérifier que le message est disponible hors ligne
    const offlineDoc = await getDoc(messageRef);
    expect(offlineDoc.exists()).toBe(true);
    expect(offlineDoc.data()?.text).toBe('Message hors ligne');

    // Réactiver le réseau et vérifier la synchronisation
    await enableNetwork(db);
    const onlineDoc = await getDoc(messageRef);
    expect(onlineDoc.exists()).toBe(true);
    expect(onlineDoc.data()?.text).toBe('Message hors ligne');
  });

  test('gère les conflits de synchronisation', async () => {
    await disableNetwork(db);
    
    // Créer un message hors ligne
    const messageRef = doc(db, 'messages', 'msg2');
    await setDoc(messageRef, {
      senderId: 'jeune123',
      recipientId: 'referent123',
      text: 'Version 1',
      createdAt: new Date(),
    });

    // Modifier le message hors ligne
    await setDoc(messageRef, {
      senderId: 'jeune123',
      recipientId: 'referent123',
      text: 'Version 2',
      createdAt: new Date(),
    });

    // Vérifier que la dernière version est disponible
    const offlineDoc = await getDoc(messageRef);
    expect(offlineDoc.data()?.text).toBe('Version 2');

    // Réactiver le réseau et vérifier la synchronisation
    await enableNetwork(db);
    const onlineDoc = await getDoc(messageRef);
    expect(onlineDoc.data()?.text).toBe('Version 2');
  });
}); 