import { ThemedText } from '@/components/themed-text';
import { useLocation } from '@/hooks/use-location';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Temple } from '@/services/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Local images for pagodas
const PAGODA_IMAGES = {
  'chua-ang': require('@/assets/images/chuaang1.jpg'),
  'chua-hang': require('@/assets/images/chuahang.jpg'),
  'chua-sleng-cu': require('@/assets/images/chuaslengcu.jpg'),
  'default': require('@/assets/images/chua1.jpg'),
};

const getPagodaImage = (templeId: string, templeName: string) => {
  if (PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES]) {
    return PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES];
  }

  const nameKey = templeName.toLowerCase()
    .replace(/chùa\s*/g, 'chua-')
    .replace(/\s+/g, '-')
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd');

  if (PAGODA_IMAGES[nameKey as keyof typeof PAGODA_IMAGES]) {
    return PAGODA_IMAGES[nameKey as keyof typeof PAGODA_IMAGES];
  }

  return PAGODA_IMAGES.default;
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

// Calculate estimated travel time (assuming average speed)
function calculateTravelTime(distance: number, mode: 'driving' | 'walking' | 'motorbike'): string {
  let speed: number; // km/h
  switch (mode) {
    case 'driving':
      speed = 50; // Average highway/city driving speed
      break;
    case 'walking':
      speed = 5; // Average walking speed
      break;
    case 'motorbike':
      speed = 40; // Average motorbike speed in Vietnam
      break;
    default:
      speed = 40;
  }

  const timeInHours = distance / speed;
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);

  if (hours > 0) {
    // Format: 1:30 (1 giờ 30 phút)
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } else {
    // Format: 0:45 (45 phút)
    return `0:${minutes.toString().padStart(2, '0')}`;
  }
}

// Navigation instruction type
interface NavigationStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  location: [number, number]; // [longitude, latitude]
  maneuver?: string;
}

// Convert OSRM maneuver to Vietnamese instruction
const getVietnameseInstruction = (step: any): string => {
  const { maneuver, name } = step;
  const modifier = maneuver?.modifier || '';
  const type = maneuver?.type || '';

  let action = 'Đi thẳng';

  if (type === 'arrive') {
    return 'Đã đến nơi';
  } else if (type === 'depart') {
    action = 'Bắt đầu';
  } else if (type === 'roundabout') {
    action = 'Đi vào vòng xuyến';
  } else {
    // Handle 'turn', 'end of road', etc.
    if (modifier.includes('left')) action = 'Rẽ trái';
    else if (modifier.includes('right')) action = 'Rẽ phải';
    else if (modifier.includes('uturn')) action = 'Quay đầu';
  }

  if (name && action !== 'Bắt đầu' && action !== 'Đã đến nơi') {
    return `${action} vào ${name}`;
  } else if (name && action === 'Bắt đầu') {
    return `Bắt đầu đi trên ${name}`;
  }

  return action;
};

export default function DirectionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tintColor = useThemeColor({}, 'tint');
  const { location, loading: locationLoading, error: locationError } = useLocation();

  const [selectedMode, setSelectedMode] = useState<'driving' | 'walking' | 'motorbike'>('motorbike');
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number, longitude: number }[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [remainingDistance, setRemainingDistance] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<NavigationStep | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [heading, setHeading] = useState<number>(0);
  const [isNavCardExpanded, setIsNavCardExpanded] = useState(true);

  // Map settings
  const [mapType, setMapType] = useState<'standard' | 'hybrid'>('standard');
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);



  const handleBackPress = () => {
    // Dừng dẫn đường tự động khi chuyển trang
    if (isNavigating) {
      setIsNavigating(false);
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    }

    // Get the source page from params to navigate back correctly
    const source = params.source as string;

    if (source === 'pagoda-detail') {
      router.push({
        pathname: '/pagoda-detail',
        params: {
          id: temple.id,
          name: temple.name,
          location: temple.location,
          rental: temple.rental,
          description: temple.description,
          imageUrl: temple.imageUrl,
          category: temple.category,
          isFavorite: params.isFavorite,
          latitude: temple.latitude?.toString(),
          longitude: temple.longitude?.toString(),
        }
      });
    } else if (source === 'explore') {
      router.push('/explore');
    } else if (source === 'index') {
      router.push('/');
    } else {
      // Default fallback - try to go back, if not possible go to home
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

  // Parse temple data from params
  const temple: Temple = {
    id: params.id as string,
    name: params.name as string,
    location: params.location as string,
    rental: params.rental as string,
    description: params.description as string,
    imageUrl: params.imageUrl as string,
    category: params.category as string,
    latitude: params.latitude ? parseFloat(params.latitude as string) : undefined,
    longitude: params.longitude ? parseFloat(params.longitude as string) : undefined,
  };

  // Reset trạng thái dẫn đường khi chuyển sang xem chùa mới
  useEffect(() => {
    setIsNavigating(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, [temple.id]);

  // Calculate distance and travel time when location is available
  useEffect(() => {
    if (location && temple.latitude && temple.longitude) {
      setCurrentLocation(location);

      // Fetch route
      fetchRoute();
    }
  }, [location, temple.latitude, temple.longitude, selectedMode]);

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);



  const fetchRoute = async () => {
    if (!location || !temple.latitude || !temple.longitude) return;

    setIsLoadingRoute(true);

    console.log('� Strart location:', location.coords.latitude, location.coords.longitude);
    console.log('🏯 Temple location:', temple.latitude, temple.longitude);
    console.log('📏 Straight line distance:', calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      temple.latitude,
      temple.longitude
    ).toFixed(2), 'km');

    try {
      // OSRM API - Free, no API key needed!
      // Convert travel mode
      let profile = 'car';
      if (selectedMode === 'walking') profile = 'foot';
      else if (selectedMode === 'motorbike') profile = 'car'; // Use car for motorbike

      // Add alternatives=true to get multiple routes and pick shortest
      const url = `https://router.project-osrm.org/route/v1/${profile}/${location.coords.longitude},${location.coords.latitude};${temple.longitude},${temple.latitude}?overview=full&geometries=geojson&alternatives=true&steps=true`;

      console.log('🗺️ Fetching route from OSRM...');

      const response = await fetch(url);
      const data = await response.json();

      console.log('📡 API Response status:', data.code);

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // Sort routes by distance to get the shortest one
        const sortedRoutes = data.routes.sort((a: any, b: any) => a.distance - b.distance);
        const route = sortedRoutes[0]; // Pick shortest route

        console.log('✅ Route found! Coordinates count:', route.geometry.coordinates.length);
        console.log('📊 Found', data.routes.length, 'alternative routes, using shortest');
        console.log('🛣️ Route distance from API:', (route.distance / 1000).toFixed(2), 'km');

        // Convert GeoJSON coordinates to React Native Maps format
        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        console.log('🗺️ First 3 route points:', coordinates.slice(0, 3));
        console.log('🗺️ Last 3 route points:', coordinates.slice(-3));

        setRouteCoordinates(coordinates);

        // Extract navigation steps
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          const steps: NavigationStep[] = route.legs[0].steps.map((step: any) => ({
            instruction: getVietnameseInstruction(step),
            distance: step.distance,
            duration: step.duration,
            location: step.maneuver.location,
            maneuver: step.maneuver.modifier ? `${step.maneuver.type} ${step.maneuver.modifier}` : step.maneuver.type
          }));
          setNavigationSteps(steps);
          if (steps.length > 0) {
            setCurrentStep(steps[0]);
          }
        }

        // Update distance and time from API
        const actualDistanceKm = route.distance / 1000;
        setDistance(actualDistanceKm); // Convert meters to km
        setRemainingDistance(actualDistanceKm);

        // Đoạn này dùng hàm tự tính thời gian thay vì API
        const realisticTime = calculateTravelTime(actualDistanceKm, selectedMode);
        setTravelTime(realisticTime);

        console.log('⏱️ Duration calculated:', realisticTime);
        setIsLoadingRoute(false);
      } else {
        console.log('⚠️ No route found in API response, using straight line');
        console.log('Error:', data.message || 'Unknown error');
        // Fallback to straight line if API fails
        const dist = calculateDistance(location.coords.latitude, location.coords.longitude, temple.latitude, temple.longitude);
        setDistance(dist);
        setTravelTime(calculateTravelTime(dist, selectedMode));

        setRouteCoordinates([
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          {
            latitude: temple.latitude,
            longitude: temple.longitude,
          },
        ]);
        setIsLoadingRoute(false);
      }
    } catch (error) {
      console.error('❌ Error fetching route:', error);
      // Fallback to straight line
      const dist = calculateDistance(location.coords.latitude, location.coords.longitude, temple.latitude, temple.longitude);
      setDistance(dist);
      setTravelTime(calculateTravelTime(dist, selectedMode));

      setRouteCoordinates([
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          latitude: temple.latitude,
          longitude: temple.longitude,
        },
      ]);
      setIsLoadingRoute(false);
    }
  };

  // Start real-time navigation
  const startNavigation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập vị trí để bắt đầu dẫn đường');
        return;
      }

      setIsNavigating(true);

      // Start watching location with high accuracy
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 5, // Update every 5 meters
        },
        (newLocation) => {
          setCurrentLocation(newLocation);

          // Update heading/bearing
          if (newLocation.coords.heading !== null && newLocation.coords.heading !== undefined) {
            setHeading(newLocation.coords.heading);
          }

          // Calculate remaining distance to destination (straight line for arrival check)
          if (temple.latitude && temple.longitude) {
            const straightDistance = calculateDistance(
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              temple.latitude,
              temple.longitude
            );

            // Check if arrived (within 50 meters)
            if (straightDistance < 0.05) {
              stopNavigation();
              Alert.alert('Đã đến nơi!', `Bạn đã đến ${temple.name}`);
            }

            // Update remaining distance based on route (not straight line)
            // Keep the original distance from API route for display
            // Only update if we have navigation steps
            if (navigationSteps.length > 0 && currentStep) {
              // Calculate remaining distance along the route
              let remainingRouteDistance = 0;
              let foundCurrentStep = false;

              for (const step of navigationSteps) {
                if (step === currentStep) {
                  foundCurrentStep = true;
                }
                if (foundCurrentStep) {
                  remainingRouteDistance += step.distance / 1000; // Convert to km
                }
              }

              if (remainingRouteDistance > 0) {
                setRemainingDistance(remainingRouteDistance);
              }
            }
          }

          // Update current navigation step
          updateNavigationStep(newLocation);

          // Center map on user location
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              },
              pitch: 60, // 3D view
              heading: newLocation.coords.heading || 0,
              zoom: 17,
            }, { duration: 500 });
          }
        }
      );
    } catch (error) {
      console.error('Error starting navigation:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu dẫn đường');
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Reset map view
    if (mapRef.current && location && temple.latitude && temple.longitude) {
      mapRef.current.animateCamera({
        center: {
          latitude: (location.coords.latitude + temple.latitude) / 2,
          longitude: (location.coords.longitude + temple.longitude) / 2,
        },
        pitch: 0,
        heading: 0,
        zoom: 13,
      }, { duration: 1000 });
    }
  };

  // Update current navigation step based on location
  const updateNavigationStep = (newLocation: Location.LocationObject) => {
    if (navigationSteps.length === 0) return;

    // Find the closest upcoming step
    let closestStepIndex = 0;
    let minDistance = Infinity;

    navigationSteps.forEach((step, index) => {
      const dist = calculateDistance(
        newLocation.coords.latitude,
        newLocation.coords.longitude,
        step.location[1], // latitude
        step.location[0]  // longitude
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestStepIndex = index;
      }
    });

    // If we're close to the next step (within 30 meters), move to it
    if (minDistance < 0.03 && closestStepIndex < navigationSteps.length - 1) {
      setCurrentStep(navigationSteps[closestStepIndex + 1]);
    } else {
      setCurrentStep(navigationSteps[closestStepIndex]);
    }
  };

  // Get maneuver icon
  const getManeuverIcon = (maneuver?: string): string => {
    if (!maneuver) return 'navigate';

    if (maneuver.includes('left')) return 'arrow-back';
    if (maneuver.includes('right')) return 'arrow-forward';
    if (maneuver.includes('straight')) return 'arrow-up';
    if (maneuver.includes('uturn')) return 'return-down-back';
    if (maneuver === 'arrive') return 'flag';

    return 'navigate';
  };
  // Center map on user location
  const centerOnUser = () => {
    if (mapRef.current && (currentLocation || location)) {
      const userLoc = currentLocation || location;
      if (userLoc) {
        mapRef.current.animateCamera({
          center: {
            latitude: userLoc.coords.latitude,
            longitude: userLoc.coords.longitude,
          },
          zoom: 16,
        }, { duration: 500 });
      }
    }
  };

  // Recenter map to show both user and temple
  const recenterMap = () => {
    if (!mapRef.current || !temple.latitude || !temple.longitude) return;
    if (location) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.coords.latitude, longitude: location.coords.longitude },
          { latitude: temple.latitude, longitude: temple.longitude }
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    } else {
      mapRef.current.animateToRegion({
        latitude: temple.latitude,
        longitude: temple.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  // Toggle map view type
  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'hybrid' : 'standard');
  };

  return (
    <View style={styles.container}>
      {/* Map View - Full Screen */}
      {temple.latitude && temple.longitude && (
        <View style={styles.fullMapContainer}>
          <MapView
            ref={mapRef}
            style={styles.fullMap}
            mapType={mapType}
            showsUserLocation={!isNavigating}
            showsMyLocationButton={false}
            showsCompass={false}
            showsTraffic={false}
            initialRegion={location ? {
              latitude: (location.coords.latitude + temple.latitude) / 2,
              longitude: (location.coords.longitude + temple.longitude) / 2,
              latitudeDelta: Math.abs(location.coords.latitude - temple.latitude) * 2.5 || 0.05,
              longitudeDelta: Math.abs(location.coords.longitude - temple.longitude) * 2.5 || 0.05,
            } : {
              latitude: temple.latitude,
              longitude: temple.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Custom user location marker (when navigating) */}
            {isNavigating && currentLocation && (
              <Marker
                key="user-navigating"
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
                rotation={heading}
              >
                <View style={styles.userMarker}>
                  <Ionicons name="navigate" size={36} color="#ff0000ff" />
                </View>
              </Marker>
            )}

            {/* Static user location marker (when not navigating) */}
            {!isNavigating && location && (
              <Marker
                key="user-static"
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Vị trí của bạn"
              >
                <View style={styles.staticUserMarker}>
                  <Ionicons name="person" size={16} color="#ffffff" />
                </View>
              </Marker>
            )}

            {/* Temple marker */}
            <Marker
              key="temple"
              coordinate={{
                latitude: temple.latitude,
                longitude: temple.longitude,
              }}
              title={temple.name}
              description={temple.location}
            >
              <View style={styles.templeMarker}>
                <Ionicons name="location" size={40} color="#ff6b57" />
              </View>
            </Marker>

            {/* Route line */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4285f4"
                strokeWidth={6}
                lineDashPattern={[0]}
              />
            )}
          </MapView>

          {/* Floating Header */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity
              style={styles.floatingBackBtn}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#2d2d2d" />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <ThemedText style={styles.floatingHeaderTitle} numberOfLines={1}>
                {temple.name}
              </ThemedText>
            </View>

            {/* Expand/Collapse Navigation Card Button */}
            {isNavigating && (
              <TouchableOpacity
                onPress={() => setIsNavCardExpanded(!isNavCardExpanded)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={isNavCardExpanded ? "chevron-up" : "chevron-down"}
                  size={28}
                  color="#ff0000ff"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Map Control Buttons */}
          <View style={styles.mapControlButtons}>
            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={toggleMapType}
            >
              <Ionicons name="layers" size={24} color={mapType !== 'standard' ? '#4285f4' : '#2d2d2d'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={centerOnUser}
            >
              <Ionicons name="locate" size={24} color="#2d2d2d" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={recenterMap}
            >
              <Ionicons name="resize" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </View>

          {/* Navigation Instructions Card (when navigating) */}
          {isNavigating && currentStep && isNavCardExpanded && (
            <View style={styles.floatingNavigationCard}>
              <View style={styles.navCardHeader}>
                <View style={styles.navManeuverIcon}>
                  <Ionicons
                    name={getManeuverIcon(currentStep.maneuver) as any}
                    size={24}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.navCardInfo}>
                  <ThemedText style={styles.navInstruction} numberOfLines={2}>
                    {currentStep.instruction}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.navStatsRow}>
                <View style={styles.navStat}>
                  <Ionicons name="navigate-outline" size={16} color="#ffffffff" />
                  <ThemedText style={styles.navStatText}>
                    {remainingDistance ? `${remainingDistance.toFixed(1)} km` : '-'}
                  </ThemedText>
                </View>
                <View style={styles.navStatDivider} />
                <View style={styles.navStat}>
                  <Ionicons name="time-outline" size={16} color="#ffffffff" />
                  <ThemedText style={styles.navStatText}>
                    {isLoadingRoute ? 'Đang tính...' : travelTime}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Action Card - Fixed */}
          <View style={styles.bottomActionCard}>
            {/* Drag Handle - Visual only */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <ScrollView
              style={styles.bottomScrollView}
              showsVerticalScrollIndicator={false}
            >
              {!isNavigating ? (
                <>
                  {/* Temple Quick Info Removed */}

                  {/* Travel Mode Selector */}
                  <View style={styles.travelModeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.travelModeBtn,
                        selectedMode === 'motorbike' && styles.travelModeBtnActive
                      ]}
                      onPress={() => setSelectedMode('motorbike')}
                    >
                      <Ionicons
                        name="bicycle"
                        size={20}
                        color={selectedMode === 'motorbike' ? '#4285f4' : '#999999'}
                      />
                      <ThemedText style={[
                        styles.travelModeText,
                        selectedMode === 'motorbike' && styles.travelModeTextActive
                      ]}>
                        Xe máy
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.travelModeBtn,
                        selectedMode === 'driving' && styles.travelModeBtnActive
                      ]}
                      onPress={() => setSelectedMode('driving')}
                    >
                      <Ionicons
                        name="car"
                        size={20}
                        color={selectedMode === 'driving' ? '#4285f4' : '#999999'}
                      />
                      <ThemedText style={[
                        styles.travelModeText,
                        selectedMode === 'driving' && styles.travelModeTextActive
                      ]}>
                        Xe hơi
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Start Navigation Button */}
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={startNavigation}
                  >
                    <Ionicons name="navigate" size={24} color="#ffffff" />
                    <ThemedText style={styles.primaryActionText}>
                      Bắt đầu dẫn đường
                    </ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Temple Quick Info (Navigating) Removed */}

                  {/* Travel Mode Selector - When Navigating */}
                  <View style={styles.travelModeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.travelModeBtn,
                        selectedMode === 'motorbike' && styles.travelModeBtnActive
                      ]}
                      onPress={() => setSelectedMode('motorbike')}
                    >
                      <Ionicons
                        name="bicycle"
                        size={20}
                        color={selectedMode === 'motorbike' ? '#4285f4' : '#999999'}
                      />
                      <ThemedText style={[
                        styles.travelModeText,
                        selectedMode === 'motorbike' && styles.travelModeTextActive
                      ]}>
                        Xe máy
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.travelModeBtn,
                        selectedMode === 'driving' && styles.travelModeBtnActive
                      ]}
                      onPress={() => setSelectedMode('driving')}
                    >
                      <Ionicons
                        name="car"
                        size={20}
                        color={selectedMode === 'driving' ? '#4285f4' : '#999999'}
                      />
                      <ThemedText style={[
                        styles.travelModeText,
                        selectedMode === 'driving' && styles.travelModeTextActive
                      ]}>
                        Xe hơi
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Stop Navigation Button */}
                  <TouchableOpacity
                    style={styles.stopActionBtn}
                    onPress={stopNavigation}
                  >
                    <Ionicons name="stop-circle" size={24} color="#ffffff" />
                    <ThemedText style={styles.stopActionText}>
                      Dừng dẫn đường
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fullMapContainer: {
    flex: 1,
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 4,
  },
  floatingBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  floatingHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 2,
  },
  floatingHeaderSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  mapControlButtons: {
    position: 'absolute',
    right: 15,
    top: 130,
    gap: 10,
  },
  mapControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingNavigationCard: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: '#4285f4',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  navCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  navManeuverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navCardInfo: {
    flex: 1,
  },
  navInstruction: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
  },
  navDistance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  navStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  navStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navStatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  navStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomActionCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 45,
  },
  dragHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  bottomScrollView: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  templeQuickInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templeQuickImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  templeQuickDetails: {
    flex: 1,
  },
  templeQuickName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  templeQuickLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templeQuickLocationText: {
    fontSize: 13,
    color: '#666666',
  },
  travelModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  travelModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  travelModeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  travelModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
  travelModeTextActive: {
    color: '#4285f4',
  },
  primaryActionBtn: {
    backgroundColor: '#4285f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stopActionBtn: {
    backgroundColor: '#ff6b57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stopActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  userMarker: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4, // Padding nhẹ để xoay (rotation) không bị mất viền
  },
  staticUserMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  templeMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});