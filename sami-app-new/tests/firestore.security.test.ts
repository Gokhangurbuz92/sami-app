import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { setDoc, doc, getDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'sami-app',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  // Tests pour les utilisateurs
  test('permet à un admin de lire tous les utilisateurs', async () => {
    const adminDb = testEnv.authenticatedContext('admin1', { role: 'admin' }).firestore();
    await expect(getDoc(doc(adminDb, 'users', 'user1'))).resolves.toBeDefined();
  });

  test('empêche un jeune de lire les autres jeunes', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune1', { role: 'jeune' }).firestore();
    await expect(getDoc(doc(jeuneDb, 'users', 'jeune2'))).rejects.toThrow(/permission-denied/);
  });

  // Tests pour les messages
  test('permet à un jeune d\'envoyer un message', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune1', { role: 'jeune' }).firestore();
    await expect(addDoc(collection(jeuneDb, 'messages'), {
      senderId: 'jeune1',
      recipientId: 'referent1',
      text: 'Bonjour',
      createdAt: new Date(),
    })).resolves.toBeDefined();
  });

  test('empêche un message de plus de 1000 caractères', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune1', { role: 'jeune' }).firestore();
    const longText = 'a'.repeat(1001);
    await expect(addDoc(collection(jeuneDb, 'messages'), {
      senderId: 'jeune1',
      recipientId: 'referent1',
      text: longText,
      createdAt: new Date(),
    })).rejects.toThrow(/permission-denied/);
  });

  // Tests pour les rendez-vous
  test('permet à un référent de créer un rendez-vous', async () => {
    const referentDb = testEnv.authenticatedContext('referent1', { role: 'referent' }).firestore();
    await expect(addDoc(collection(referentDb, 'appointments'), {
      youthId: 'jeune1',
      referentId: 'referent1',
      date: new Date(),
      type: 'medical',
      status: 'scheduled',
    })).resolves.toBeDefined();
  });

  test('empêche un jeune de modifier un rendez-vous', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune1', { role: 'jeune' }).firestore();
    await expect(setDoc(doc(jeuneDb, 'appointments', 'app1'), {
      status: 'cancelled',
    })).rejects.toThrow(/permission-denied/);
  });

  // Tests pour les documents
  test('permet à un admin de supprimer un document', async () => {
    const adminDb = testEnv.authenticatedContext('admin1', { role: 'admin' }).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminDb) => {
      await setDoc(doc(adminDb.firestore(), 'documents', 'doc1'), {
        type: 'identity',
        youthId: 'jeune1',
        createdAt: new Date(),
      });
    });

    await expect(deleteDoc(doc(adminDb, 'documents', 'doc1'))).resolves.toBeUndefined();
  });

  test('empêche un jeune de supprimer un document', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune1', { role: 'jeune' }).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminDb) => {
      await setDoc(doc(adminDb.firestore(), 'documents', 'doc1'), {
        type: 'identity',
        youthId: 'jeune1',
        createdAt: new Date(),
      });
    });

    await expect(deleteDoc(doc(jeuneDb, 'documents', 'doc1'))).rejects.toThrow(/permission-denied/);
  });
}); 