import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { format, subDays } from 'date-fns';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface TrendData {
  date: string;
  count: number;
}

type TrendPeriod = 7 | 30 | 90 | 180 | 365;

/**
 * Hook for fetching sin count trend data
 */
export const useTrendData = (period: TrendPeriod = 7) => {
  const { user } = useAuth();
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const startDate = subDays(new Date(), period);
        const startDateStr = format(startDate, 'yyyy-MM-dd');

        if (!db) {
          setError('Database not initialized');
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, 'users', user.uid, 'dailyCounts'),
          where('__name__', '>=', startDateStr),
          orderBy('__name__')
        );

        const querySnapshot = await getDocs(q);
        const trendData: TrendData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          trendData.push({
            date: doc.id,
            count: data.count || 0,
          });
        });

        // Fill in missing dates with count 0
        const filledData: TrendData[] = [];
        for (let i = period - 1; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const existingData = trendData.find((d) => d.date === date);
          filledData.push({
            date,
            count: existingData?.count || 0,
          });
        }

        setData(filledData);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError('Failed to load trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [user, period]);

  /**
   * Calculate percentage change from previous period
   */
  const getPercentageChange = (): number | null => {
    if (data.length < 2) return null;

    // Compare today's count with yesterday's count
    const today = data[data.length - 1];
    const yesterday = data[data.length - 2];

    if (!today || !yesterday) return null;

    // If yesterday was 0, return null to avoid division by zero
    if (yesterday.count === 0) {
      return today.count > 0 ? 100 : null;
    }

    return ((today.count - yesterday.count) / yesterday.count) * 100;
  };

  return {
    data,
    loading,
    error,
    getPercentageChange,
  };
};
