import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { FieldValue } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DailyCount {
  count: number;
  ts: FieldValue;
}

/**
 * Hook for managing daily sin counter
 */
export const useSinCounter = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load today's count from Firestore
  useEffect(() => {
    const loadTodaysCount = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get from Firestore
      try {
        const db = await getFirebaseDb();
        const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DailyCount;
          setCount(data.count || 0);
        } else {
          setCount(0);
        }
      } catch (error) {
        console.error('Error loading count:', error);
        setCount(0);
      }

      setLoading(false);
    };

    loadTodaysCount();
  }, [user, today]);

  /**
   * Increment the sin counter
   */
  const increment = async () => {
    if (!user) return;

    const newCount = count + 1;
    setCount(newCount);

    // Sync with Firestore
    try {
      const db = await getFirebaseDb();
      const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
      await setDoc(docRef, {
        count: newCount,
        ts: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error syncing count:', error);
      // Revert the count on error
      setCount(count);
    }
  };

  /**
   * Decrement the sin counter (minimum 0)
   */
  const decrement = async () => {
    if (!user || count <= 0) return;

    const newCount = count - 1;
    setCount(newCount);

    // Sync with Firestore
    try {
      const db = await getFirebaseDb();
      const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
      await setDoc(docRef, {
        count: newCount,
        ts: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error syncing count:', error);
      // Revert the count on error
      setCount(count);
    }
  };

  return {
    count,
    loading,
    increment,
    decrement,
  };
};
