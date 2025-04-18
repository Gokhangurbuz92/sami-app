import { initializeFirestore, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { setDoc, doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('Firestore Offline Resilience', () => {
  let db: any;

  beforeEach(async () => {
    const app = initializeApp({ projectId: 'sami-app' });
    db = initializeFirestore(app, {});
    await enableIndexedDbPersistence(db);
  });

  afterEach(async () => {
    await enableNetwork(db);
  });

  test('enregistre un message offline et synchronise', async () => {
    await disableNetwork(db);

    const messageRef = doc(db, 'messages', 'msg1');
    await setDoc(messageRef, {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Salut offline',
      createdAt: new Date(),
    });

    const offlineDoc = await getDoc(messageRef);
    expect(offlineDoc.exists()).toBe(true);
    expect(offlineDoc.data().text).toBe('Salut offline');

    await enableNetwork(db);
    const onlineDoc = await getDoc(messageRef);
    expect(onlineDoc.exists()).toBe(true);
    expect(onlineDoc.data().text).toBe('Salut offline');
  });

  test('gère plusieurs messages offline', async () => {
    await disableNetwork(db);

    const messages = [
      { text: 'Message 1', createdAt: new Date() },
      { text: 'Message 2', createdAt: new Date() },
      { text: 'Message 3', createdAt: new Date() },
    ];

    for (const message of messages) {
      await addDoc(collection(db, 'messages'), {
        senderId: 'alice',
        recipientId: 'bob',
        ...message,
      });
    }

    const offlineSnapshot = await getDocs(collection(db, 'messages'));
    expect(offlineSnapshot.docs.length).toBe(3);

    await enableNetwork(db);
    const onlineSnapshot = await getDocs(collection(db, 'messages'));
    expect(onlineSnapshot.docs.length).toBe(3);
  });

  test('gère les modifications offline', async () => {
    await disableNetwork(db);

    const messageRef = doc(db, 'messages', 'msg1');
    await setDoc(messageRef, {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Premier message',
      createdAt: new Date(),
    });

    await setDoc(messageRef, {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Message modifié',
      createdAt: new Date(),
    });

    const offlineDoc = await getDoc(messageRef);
    expect(offlineDoc.data().text).toBe('Message modifié');

    await enableNetwork(db);
    const onlineDoc = await getDoc(messageRef);
    expect(onlineDoc.data().text).toBe('Message modifié');
  });

  test('gère les suppressions offline', async () => {
    await disableNetwork(db);

    const messageRef = doc(db, 'messages', 'msg1');
    await setDoc(messageRef, {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Message à supprimer',
      createdAt: new Date(),
    });

    await deleteDoc(messageRef);
    const offlineDoc = await getDoc(messageRef);
    expect(offlineDoc.exists()).toBe(false);

    await enableNetwork(db);
    const onlineDoc = await getDoc(messageRef);
    expect(onlineDoc.exists()).toBe(false);
  });
}); 