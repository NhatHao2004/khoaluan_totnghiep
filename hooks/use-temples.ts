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

  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading favorites...');
      const data = await getFavoriteTemples();
      console.log('✅ Favorites loaded:', data.length, data);
      setFavorites(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading favorites:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const refresh = () => {
    console.log('🔄 Refreshing favorites...');
    loadFavorites();
  };

  return { favorites, loading, error, refresh };
}
