import { getFavoriteTemples, getTemples, Temple } from '@/services/firebase-service';
import { useCallback, useEffect, useState } from 'react';

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

export function useFavoriteTemples(userId?: string) {
  const [favorites, setFavorites] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading favorites for user:', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 25s')), 25000)
      );
      
      const dataPromise = getFavoriteTemples();
      const data = await Promise.race([dataPromise, timeoutPromise]) as Temple[];
      
      console.log('✅ Favorites loaded:', data?.length || 0);
      setFavorites(data || []);
    } catch (err) {
      console.error('❌ Error loading favorites:', err);
      setError(err as Error);
      if (favorites.length === 0) {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    if (!userId) return;
    
    const now = Date.now();
    if (now - lastRefreshTime < 1000) {
      return;
    }
    
    setLastRefreshTime(now);
    loadFavorites();
  }, [userId, lastRefreshTime, loadFavorites]);

  return { favorites, loading, error, refresh };
}
