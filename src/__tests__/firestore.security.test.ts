import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { setDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

  test('permet à un jeune de lire ses messages', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune123', { role: 'jeune' }).firestore();
    
    // Créer un message avec l'admin
    await testEnv.withSecurityRulesDisabled(async (adminDb) => {
      await setDoc(doc(adminDb.firestore(), 'messages', 'msg1'), {
        senderId: 'jeune123',
        recipientId: 'referent123',
        text: 'Salut',
        createdAt: new Date(),
      });
    });

    // Vérifier que le jeune peut lire son message
    const msgDoc = await getDoc(doc(jeuneDb, 'messages', 'msg1'));
    expect(msgDoc.exists()).toBe(true);
  });

  test('empêche un jeune de lire les messages des autres', async () => {
    const jeuneDb = testEnv.authenticatedContext('jeune123', { role: 'jeune' }).firestore();
    
    // Créer un message d'un autre jeune
    await testEnv.withSecurityRulesDisabled(async (adminDb) => {
      await setDoc(doc(adminDb.firestore(), 'messages', 'msg2'), {
        senderId: 'autreJeune',
        recipientId: 'referent123',
        text: 'Message privé',
        createdAt: new Date(),
      });
    });

    // Vérifier que le jeune ne peut pas lire le message
    await expect(getDoc(doc(jeuneDb, 'messages', 'msg2'))).rejects.toThrow();
  });

  test('permet à un référent de lire les messages de ses jeunes', async () => {
    const referentDb = testEnv.authenticatedContext('referent123', { role: 'referent' }).firestore();
    
    // Créer un message d'un jeune assigné
    await testEnv.withSecurityRulesDisabled(async (adminDb) => {
      await setDoc(doc(adminDb.firestore(), 'messages', 'msg3'), {
        senderId: 'jeune123',
        recipientId: 'referent123',
        text: 'Message au référent',
        createdAt: new Date(),
      });
    });

    // Vérifier que le référent peut lire le message
    const msgDoc = await getDoc(doc(referentDb, 'messages', 'msg3'));
    expect(msgDoc.exists()).toBe(true);
  });
}); 