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
      setError(null);
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setError('Vui lòng bật dịch vụ vị trí (GPS) trên thiết bị');
        setLoading(false);
        return;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Vui lòng cấp quyền truy cập vị trí cho ứng dụng');
        setLoading(false);
        return;
      }

      // Get current location with timeout
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
      });
      
      setLocation(currentLocation);
      setError(null);
    } catch (err: any) {
      console.error('Error getting location:', err);
      
      // More specific error messages
      if (err.code === 'E_LOCATION_TIMEOUT') {
        setError('Không thể lấy vị trí (timeout). Vui lòng thử lại');
      } else if (err.code === 'E_LOCATION_UNAVAILABLE') {
        setError('Dịch vụ vị trí không khả dụng');
      } else {
        setError('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS và thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refresh: getLocation };
}
