import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, addDoc, getDocs, setDoc, doc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('Firestore i18n Integration', () => {
  let testEnv: RulesTestEnvironment;

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'sami-app',
    });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  test('enregistre un message avec langue', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    await addDoc(collection(aliceDb, 'messages'), {
      senderId: 'alice',
      recipientId: 'bob',
      text: 'Salut',
      language: 'fr',
      createdAt: new Date(),
    });

    const snapshot = await getDocs(collection(aliceDb, 'messages'));
    expect(snapshot.docs[0].data().language).toBe('fr');
  });

  test('gère les traductions de notifications', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const notifications = [
      {
        title: { fr: 'Rappel', en: 'Reminder', ar: 'تذكير' },
        body: { fr: 'Votre rendez-vous', en: 'Your appointment', ar: 'موعدك' },
        type: 'appointment',
        createdAt: new Date(),
      },
      {
        title: { fr: 'Message', en: 'Message', ar: 'رسالة' },
        body: { fr: 'Nouveau message', en: 'New message', ar: 'رسالة جديدة' },
        type: 'message',
        createdAt: new Date(),
      },
    ];

    for (const notification of notifications) {
      await addDoc(collection(aliceDb, 'notifications'), notification);
    }

    const snapshot = await getDocs(collection(aliceDb, 'notifications'));
    expect(snapshot.docs.length).toBe(2);

    // Vérifier les traductions
    const firstNotification = snapshot.docs[0].data();
    expect(firstNotification.title.fr).toBe('Rappel');
    expect(firstNotification.title.en).toBe('Reminder');
    expect(firstNotification.title.ar).toBe('تذكير');

    const secondNotification = snapshot.docs[1].data();
    expect(secondNotification.title.fr).toBe('Message');
    expect(secondNotification.title.en).toBe('Message');
    expect(secondNotification.title.ar).toBe('رسالة');
  });

  test('gère les préférences de langue utilisateur', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    await setDoc(doc(aliceDb, 'users', 'alice'), {
      name: 'Alice',
      email: 'alice@example.com',
      language: 'fr',
      createdAt: new Date(),
    });

    const userDoc = await getDoc(doc(aliceDb, 'users', 'alice'));
    expect(userDoc.data().language).toBe('fr');

    // Changer la langue
    await setDoc(doc(aliceDb, 'users', 'alice'), {
      language: 'en',
    }, { merge: true });

    const updatedUserDoc = await getDoc(doc(aliceDb, 'users', 'alice'));
    expect(updatedUserDoc.data().language).toBe('en');
  });

  test('gère les traductions de documents', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { role: 'jeune' }).firestore();
    const document = {
      type: 'identity',
      title: { fr: 'Carte d\'identité', en: 'ID Card', ar: 'بطاقة الهوية' },
      content: { fr: 'Contenu en français', en: 'Content in English', ar: 'المحتوى بالعربية' },
      createdAt: new Date(),
    };

    await addDoc(collection(aliceDb, 'documents'), document);

    const snapshot = await getDocs(collection(aliceDb, 'documents'));
    const docData = snapshot.docs[0].data();

    expect(docData.title.fr).toBe('Carte d\'identité');
    expect(docData.title.en).toBe('ID Card');
    expect(docData.title.ar).toBe('بطاقة الهوية');

    expect(docData.content.fr).toBe('Contenu en français');
    expect(docData.content.en).toBe('Content in English');
    expect(docData.content.ar).toBe('المحتوى بالعربية');
  });
}); 