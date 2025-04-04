import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function fetchYouths(youthUids: string[]) {
  const youths = [];

  for (const uid of youthUids) {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      youths.push({ uid, ...snapshot.data() });
    }
  }

  return youths;
} 