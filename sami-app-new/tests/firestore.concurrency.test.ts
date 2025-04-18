import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, addDoc, getDocs, setDoc, doc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('Firestore Concurrency', () => {
  let testEnv: RulesTestEnvironment;

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'sami-app',
    });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  test('gère 100 messages simultanés', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const messages = Array.from({ length: 100 }, (_, i) => ({
      senderId: 'alice',
      recipientId: 'bob',
      text: `Message ${i}`,
      createdAt: new Date(),
    }));

    const startTime = Date.now();
    const promises = messages.map(msg => addDoc(collection(aliceDb, 'messages'), msg));
    await Promise.all(promises);
    const endTime = Date.now();

    const snapshot = await getDocs(collection(aliceDb, 'messages'));
    expect(snapshot.docs.length).toBe(100);
    expect(snapshot.docs.map(doc => doc.data().text)).toEqual(
      messages.map(msg => msg.text)
    );

    // Vérifier que le temps d'exécution est raisonnable
    expect(endTime - startTime).toBeLessThan(5000); // 5 secondes maximum
  });

  test('gère les modifications concurrentes', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { role: 'jeune' }).firestore();

    // Créer un document initial
    const messageRef = doc(aliceDb, 'messages', 'msg1');
    await setDoc(messageRef, {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Message initial',
      createdAt: new Date(),
    });

    // Simuler des modifications concurrentes
    const modifications = [
      { text: 'Modification 1' },
      { text: 'Modification 2' },
      { text: 'Modification 3' },
    ];

    const promises = modifications.map(mod => 
      setDoc(messageRef, {
        senderId: 'alice',
        recipientId: 'bob',
        ...mod,
        createdAt: new Date(),
      })
    );

    await Promise.all(promises);

    const finalDoc = await getDoc(messageRef);
    expect(finalDoc.exists()).toBe(true);
    // Vérifier que la dernière modification a été appliquée
    expect(finalDoc.data().text).toBe('Modification 3');
  });

  test('gère les lectures concurrentes', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { role: 'jeune' }).firestore();

    // Créer plusieurs messages
    const messages = Array.from({ length: 50 }, (_, i) => ({
      senderId: 'alice',
      recipientId: 'bob',
      text: `Message ${i}`,
      createdAt: new Date(),
    }));

    for (const msg of messages) {
      await addDoc(collection(aliceDb, 'messages'), msg);
    }

    // Simuler des lectures concurrentes
    const readPromises = Array.from({ length: 10 }, () => 
      getDocs(collection(aliceDb, 'messages'))
    );

    const snapshots = await Promise.all(readPromises);
    
    // Vérifier que toutes les lectures ont réussi
    snapshots.forEach(snapshot => {
      expect(snapshot.docs.length).toBe(50);
    });
  });

  test('gère les suppressions concurrentes', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { role: 'jeune' }).firestore();

    // Créer plusieurs messages
    const messages = Array.from({ length: 50 }, (_, i) => ({
      senderId: 'alice',
      recipientId: 'bob',
      text: `Message ${i}`,
      createdAt: new Date(),
    }));

    const messageRefs = [];
    for (const msg of messages) {
      const docRef = await addDoc(collection(aliceDb, 'messages'), msg);
      messageRefs.push(docRef);
    }

    // Simuler des suppressions concurrentes
    const deletePromises = messageRefs.map(ref => deleteDoc(ref));
    await Promise.all(deletePromises);

    const finalSnapshot = await getDocs(collection(aliceDb, 'messages'));
    expect(finalSnapshot.docs.length).toBe(0);
  });
}); 