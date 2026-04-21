import { getFavoriteTemples, getTemples, Temple } from '@/services/firebase-service';
import { useEffect, useState } from 'react';

export function useTemples() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadTemples();
  }, []);

  const loadTemples = async () => {
    try {
      setLoading(true);
      const data = await getTemples();
      setTemples(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadTemples();
  };

  return { temples, loading, error, refresh };
}

export function useFavoriteTemples() {
  const [favorites, setFavorites] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading favorites...');
      
      // Tăng timeout lên 10 giây để đảm bảo Firebase có đủ thời gian
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10s')), 10000)
      );
      
      const dataPromise = getFavoriteTemples();
      const data = await Promise.race([dataPromise, timeoutPromise]) as Temple[];
      
      console.log('✅ Favorites loaded:', data?.length || 0);
      setFavorites(data || []);
      console.log('Favorites updated:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error loading favorites:', err);
      setError(err as Error);
      // Không set empty array ngay lập tức, giữ data cũ nếu có
      if (favorites.length === 0) {
        setFavorites([]);
      }
    } finally {
      console.log('🏁 Loading finished');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const refresh = () => {
    const now = Date.now();
    // Giảm debounce xuống 1 giây để responsive hơn
    if (now - lastRefreshTime < 1000) {
      console.log('🚫 Refresh debounced (too soon)');
      return;
    }
    
    console.log('🔄 Refreshing favorites...');
    setLastRefreshTime(now);
    loadFavorites();
  };

  return { favorites, loading, error, refresh };
}
