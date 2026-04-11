import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Vui lòng cấp quyền truy cập vị trí');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
      setError(null);
    } catch (err) {
      setError('Không thể lấy vị trí hiện tại');
      console.error('Error getting location:', err);
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refresh: getLocation };
}
