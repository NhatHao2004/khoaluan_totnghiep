import { db } from '@/config/firebase';
import {
    collection,
    doc,
    getDocs,
    updateDoc
} from 'firebase/firestore';

// Types
export interface Temple {
  id?: string;
  name: string;
  rental?: string; // Tạm thời dùng rental thay vì location
  location?: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  category: string;
  isFavorite?: boolean;
}

// Temples Collection
const templesCollection = 'temples';

// Get all temples
export const getTemples = async (): Promise<Temple[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, templesCollection));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Temple));
  } catch (error) {
    console.error('Error getting temples:', error);
    throw error;
  }
};

// Get favorite temples
export const getFavoriteTemples = async (): Promise<Temple[]> => {
  try {
    // Get all temples and filter favorites in code
    // This handles both boolean true and string "true"
    const allTemples = await getTemples();
    const favorites = allTemples.filter(temple => 
      temple.isFavorite === true || temple.isFavorite === 'true' as any
    );
    console.log('getFavoriteTemples:', { total: allTemples.length, favorites: favorites.length });
    return favorites;
  } catch (error) {
    console.error('Error getting favorite temples:', error);
    throw error;
  }
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get nearby temples (you'll need to implement geolocation logic)
export const getNearbyTemples = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 50 // km
): Promise<(Temple & { distance: number })[]> => {
  try {
    const temples = await getTemples();
    
    // Calculate distance for each temple
    const templesWithDistance = temples
      .filter(temple => temple.latitude && temple.longitude)
      .map(temple => ({
        ...temple,
        distance: calculateDistance(
          latitude,
          longitude,
          temple.latitude!,
          temple.longitude!
        ),
      }))
      .filter(temple => temple.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    return templesWithDistance;
  } catch (error) {
    console.error('Error getting nearby temples:', error);
    throw error;
  }
};

// Update temple (internal use)
const updateTemple = async (id: string, data: Partial<Temple>): Promise<void> => {
  try {
    const docRef = doc(db, templesCollection, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating temple:', error);
    throw error;
  }
};

// Toggle favorite
export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<void> => {
  try {
    await updateTemple(id, { isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};
