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
  // Extended fields for detailed content
  detailedDescription?: string[];
  additionalImages?: string[];
}

// Temples Collection
const templesCollection = 'temples';

// Get all temples
export const getTemples = async (): Promise<Temple[]> => {
  try {
    console.log('🔄 getTemples: Starting...');
    
    // Thêm timeout cho Firestore query
    const queryPromise = getDocs(collection(db, templesCollection));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore query timeout')), 8000)
    );
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    const temples = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      console.log(`📄 Temple ${doc.id}:`, {
        imageUrl: data.imageUrl?.substring(0, 50) + '...',
        additionalImages: data.additionalImages?.length || 0
      });
      return {
        id: doc.id,
        ...data
      } as Temple;
    });
    
    console.log('✅ getTemples: Success, got', temples.length, 'temples');
    return temples;
  } catch (error) {
    console.error('❌ Error getting temples:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

// Get favorite temples
export const getFavoriteTemples = async (): Promise<Temple[]> => {
  try {
    console.log('🔄 getFavoriteTemples: Starting...');
    
    // Thêm retry logic để xử lý network issues
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // Get all temples and filter favorites in code
        const allTemples = await getTemples();
        console.log('📊 getFavoriteTemples: Got all temples:', allTemples.length);
        
        if (!allTemples || allTemples.length === 0) {
          console.log('⚠️ getFavoriteTemples: No temples found');
          return [];
        }
        
        const favorites = allTemples.filter(temple => {
          const isFav = temple.isFavorite as any;
          return isFav === true || 
                 isFav === 'true' || 
                 isFav === 1 || 
                 isFav === '1' ||
                 isFav === 'yes';
        });
        
        console.log('✅ getFavoriteTemples: Success, found', favorites.length, 'favorites');
        return favorites;
        
      } catch (retryError) {
        retryCount++;
        console.log(`⚠️ getFavoriteTemples: Retry ${retryCount}/${maxRetries} failed:`, retryError);
        
        if (retryCount > maxRetries) {
          throw retryError;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting favorite temples:', error);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
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
