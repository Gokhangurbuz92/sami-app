import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getOrCreateConversation(currentUid: string, targetUid: string) {
  const convQuery = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUid)
  );

  const snapshot = await getDocs(convQuery);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (
      data.participants.includes(targetUid) &&
      data.participants.length === 2
    ) {
      return doc.id;
    }
  }

  // Conversation n'existe pas → on la crée
  const newConv = await addDoc(collection(db, "conversations"), {
    participants: [currentUid, targetUid],
    lastMessage: "",
    lastMessageTime: serverTimestamp()
  });

  return newConv.id;
} 