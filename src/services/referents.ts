import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function fetchReferents(referentUids: string[]) {
  const referents = [];

  for (const uid of referentUids) {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      referents.push({ uid, ...snapshot.data() });
    }
  }

  return referents;
}
