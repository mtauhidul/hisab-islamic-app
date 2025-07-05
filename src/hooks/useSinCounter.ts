import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DailyCount {
  count: number;
  ts: FieldValue;
}

/**
 * Hook for managing daily sin counter with offline support
 */
export const useSinCounter = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pendingSync, setPendingSync] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load today's count from Firestore or localStorage
  useEffect(() => {
    const loadTodaysCount = async () => {
      if (!user || !db) {
        setLoading(false);
        return;
      }

      // Try to get from Firestore first
      try {
        const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DailyCount;
          setCount(data.count || 0);
        } else {
          // Check localStorage for offline data
          const offlineKey = `sin-count-${user.uid}-${today}`;
          const offlineCount = localStorage.getItem(offlineKey);
          if (offlineCount) {
            setCount(parseInt(offlineCount, 10));
            setPendingSync(true);
          }
        }
      } catch (error) {
        console.error('Error loading count:', error);
        // Fallback to localStorage
        const offlineKey = `sin-count-${user.uid}-${today}`;
        const offlineCount = localStorage.getItem(offlineKey);
        if (offlineCount) {
          setCount(parseInt(offlineCount, 10));
          setPendingSync(true);
        }
      }

      setLoading(false);
    };

    loadTodaysCount();
  }, [user, today]);

  /**
   * Increment the sin counter
   */
  const increment = async () => {
    if (!user || !db) return;

    const newCount = count + 1;
    setCount(newCount);

    // Store locally immediately
    const offlineKey = `sin-count-${user.uid}-${today}`;
    localStorage.setItem(offlineKey, newCount.toString());

    // Try to sync with Firestore
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
      await setDoc(docRef, {
        count: newCount,
        ts: serverTimestamp(),
      });
      // Remove from localStorage after successful sync
      localStorage.removeItem(offlineKey);
      setPendingSync(false);
    } catch (error) {
      console.error('Error syncing count:', error);
      setPendingSync(true);
    }
  };

  /**
   * Decrement the sin counter (minimum 0)
   */
  const decrement = async () => {
    if (!user || !db || count <= 0) return;

    const newCount = count - 1;
    setCount(newCount);

    // Store locally immediately
    const offlineKey = `sin-count-${user.uid}-${today}`;
    localStorage.setItem(offlineKey, newCount.toString());

    // Try to sync with Firestore
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
      await setDoc(docRef, {
        count: newCount,
        ts: serverTimestamp(),
      });
      // Remove from localStorage after successful sync
      localStorage.removeItem(offlineKey);
      setPendingSync(false);
    } catch (error) {
      console.error('Error syncing count:', error);
      setPendingSync(true);
    }
  };

  /**
   * Sync offline data with Firestore
   */
  const syncOfflineData = async () => {
    if (!user || !db) return;

    const offlineKey = `sin-count-${user.uid}-${today}`;
    const offlineCount = localStorage.getItem(offlineKey);

    if (offlineCount) {
      try {
        const docRef = doc(db, 'users', user.uid, 'dailyCounts', today);
        await setDoc(docRef, {
          count: parseInt(offlineCount, 10),
          ts: serverTimestamp(),
        });
        localStorage.removeItem(offlineKey);
        setPendingSync(false);
      } catch (error) {
        console.error('Error syncing offline data:', error);
      }
    }
  };

  return {
    count,
    loading,
    pendingSync,
    increment,
    decrement,
    syncOfflineData,
  };
};
