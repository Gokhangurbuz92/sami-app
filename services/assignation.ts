import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs
} from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../services/userService";

// 🔗 Lier un jeune à un référent
export async function assignJeuneToReferent(jeuneUid: string, referentUid: string) {
  try {
    const jeuneRef = doc(db, "users", jeuneUid);
    const referentRef = doc(db, "users", referentUid);

    // Vérifier que les deux utilisateurs existent et ont les rôles appropriés
    const jeuneDoc = await getDoc(jeuneRef);
    const referentDoc = await getDoc(referentRef);

    if (!jeuneDoc.exists()) {
      throw new Error(`Le jeune avec l'ID ${jeuneUid} n'existe pas`);
    }

    if (!referentDoc.exists()) {
      throw new Error(`Le référent avec l'ID ${referentUid} n'existe pas`);
    }

    const jeuneData = jeuneDoc.data();
    const referentData = referentDoc.data();

    if (jeuneData.role !== 'jeune') {
      throw new Error(`L'utilisateur ${jeuneUid} n'a pas le rôle 'jeune'`);
    }

    if (!['referent', 'coreferent'].includes(referentData.role)) {
      throw new Error(`L'utilisateur ${referentUid} n'a pas le rôle 'referent' ou 'coreferent'`);
    }

    // Ajouter le référent au jeune
    await updateDoc(jeuneRef, {
      assignedReferents: arrayUnion(referentUid)
    });

    // Ajouter le jeune au référent
    await updateDoc(referentRef, {
      assignedYouths: arrayUnion(jeuneUid)
    });

    console.log("Assignation réussie !");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'assignation :", error);
    throw error;
  }
}

// 🔗 Supprimer la liaison entre un jeune et un référent
export async function removeJeuneFromReferent(jeuneUid: string, referentUid: string) {
  try {
    const jeuneRef = doc(db, "users", jeuneUid);
    const referentRef = doc(db, "users", referentUid);

    // Vérifier que l'assignation existe
    const jeuneDoc = await getDoc(jeuneRef);
    const referentDoc = await getDoc(referentRef);

    if (!jeuneDoc.exists() || !referentDoc.exists()) {
      throw new Error("L'un des utilisateurs n'existe pas");
    }

    const jeuneData = jeuneDoc.data();
    const referentData = referentDoc.data();

    const jeuneHasReferent = jeuneData.assignedReferents?.includes(referentUid);
    const referentHasJeune = referentData.assignedYouths?.includes(jeuneUid);

    if (!jeuneHasReferent || !referentHasJeune) {
      throw new Error("Cette assignation n'existe pas");
    }

    // Supprimer le référent du jeune
    await updateDoc(jeuneRef, {
      assignedReferents: arrayRemove(referentUid)
    });

    // Supprimer le jeune du référent
    await updateDoc(referentRef, {
      assignedYouths: arrayRemove(jeuneUid)
    });

    console.log("Suppression de l'assignation réussie !");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'assignation :", error);
    throw error;
  }
}

// 🔍 Vérifier si un jeune est assigné à un référent
export async function isJeuneAssignedToReferent(jeuneUid: string, referentUid: string) {
  try {
    const jeuneRef = doc(db, "users", jeuneUid);
    const jeuneDoc = await getDoc(jeuneRef);

    if (!jeuneDoc.exists()) {
      return false;
    }

    const jeuneData = jeuneDoc.data();
    return jeuneData.assignedReferents?.includes(referentUid) || false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'assignation :", error);
    throw error;
  }
}

// 📋 Obtenir tous les jeunes assignés à un référent
export async function getJeunesForReferent(referentUid: string) {
  try {
    const q = query(
      collection(db, "users"), 
      where("role", "==", "jeune"),
      where("assignedReferents", "array-contains", referentUid)
    );
    
    const querySnapshot = await getDocs(q);
    const jeunes: User[] = [];
    
    querySnapshot.forEach((doc) => {
      jeunes.push({ ...doc.data(), uid: doc.id } as User);
    });
    
    return jeunes;
  } catch (error) {
    console.error("Erreur lors de la récupération des jeunes :", error);
    throw error;
  }
}

// 📋 Obtenir tous les référents assignés à un jeune
export async function getReferentsForJeune(jeuneUid: string) {
  try {
    const q = query(
      collection(db, "users"), 
      where("role", "in", ["referent", "coreferent"]),
      where("assignedYouths", "array-contains", jeuneUid)
    );
    
    const querySnapshot = await getDocs(q);
    const referents: User[] = [];
    
    querySnapshot.forEach((doc) => {
      referents.push({ ...doc.data(), uid: doc.id } as User);
    });
    
    return referents;
  } catch (error) {
    console.error("Erreur lors de la récupération des référents :", error);
    throw error;
  }
}

// 🔄 Remplacer tous les référents d'un jeune
export async function updateJeuneReferents(jeuneUid: string, referentUids: string[]) {
  try {
    const jeuneRef = doc(db, "users", jeuneUid);
    const jeuneDoc = await getDoc(jeuneRef);
    
    if (!jeuneDoc.exists()) {
      throw new Error(`Le jeune avec l'ID ${jeuneUid} n'existe pas`);
    }
    
    const jeuneData = jeuneDoc.data();
    if (jeuneData.role !== 'jeune') {
      throw new Error(`L'utilisateur ${jeuneUid} n'a pas le rôle 'jeune'`);
    }
    
    // Obtenir la liste actuelle des référents
    const currentReferents = jeuneData.assignedReferents || [];
    
    // Référents à ajouter (nouveaux)
    const referentsToAdd = referentUids.filter(uid => !currentReferents.includes(uid));
    
    // Référents à supprimer (qui ne sont plus dans la nouvelle liste)
    const referentsToRemove = currentReferents.filter(uid => !referentUids.includes(uid));
    
    // Pour chaque nouveau référent, l'ajouter au jeune et ajouter le jeune au référent
    for (const refUid of referentsToAdd) {
      const referentRef = doc(db, "users", refUid);
      const referentDoc = await getDoc(referentRef);
      
      if (!referentDoc.exists()) {
        console.warn(`Le référent avec l'ID ${refUid} n'existe pas, ignoré`);
        continue;
      }
      
      const referentData = referentDoc.data();
      if (!['referent', 'coreferent'].includes(referentData.role)) {
        console.warn(`L'utilisateur ${refUid} n'a pas le rôle 'referent' ou 'coreferent', ignoré`);
        continue;
      }
      
      // Ajouter le jeune au référent
      await updateDoc(referentRef, {
        assignedYouths: arrayUnion(jeuneUid)
      });
    }
    
    // Pour chaque référent à supprimer, enlever le jeune de sa liste
    for (const refUid of referentsToRemove) {
      const referentRef = doc(db, "users", refUid);
      const referentDoc = await getDoc(referentRef);
      
      if (referentDoc.exists()) {
        await updateDoc(referentRef, {
          assignedYouths: arrayRemove(jeuneUid)
        });
      }
    }
    
    // Mettre à jour la liste complète des référents du jeune
    await updateDoc(jeuneRef, {
      assignedReferents: referentUids
    });
    
    console.log("Mise à jour des référents réussie !");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des référents :", error);
    throw error;
  }
} 