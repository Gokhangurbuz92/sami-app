import { useState, useEffect } from 'react';
import { collection, query, orderBy, startAfter, limit, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
}

export const usePaginatedMessages = (pageSize: number = 20) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const q = lastDoc
        ? query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(pageSize)
          )
        : query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
      
      const snapshot = await getDocs(q);
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setMessages(prev => [...prev, ...newMessages]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return { messages, loadMore, loading, hasMore };
}; 