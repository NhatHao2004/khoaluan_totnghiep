import { ThemedText } from '@/components/themed-text';
import { useLocation } from '@/hooks/use-location';
import { useTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DiscoveryItem, getDiscoveryItems } from '@/services/discovery-service';
import { getNearbyTemples, Temple } from '@/services/firebase-service';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Premium Discovery Categories
const DISCOVERY_CATEGORIES = [
  { id: 'ancient', title: 'Chùa Khmer', image: require('@/assets/images/chuaang1.jpg') },
  { id: 'peaceful', title: 'Văn hóa', image: require('@/assets/images/chuaslengcu.jpg') },
  { id: 'festival', title: 'Ẩm thực', image: require('@/assets/images/chua1.jpg') },
  { id: 'culture', title: 'Học tiếng Khmer', image: require('@/assets/images/vanhoa.jpg') },
  { id: 'cuisine', title: 'Thử thách', image: require('@/assets/images/amthuc.jpg') },
  { id: 'education', title: 'Trò chơi', image: require('@/assets/images/hoctap.jpg') },
];

export default function ExploreScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const { temples, loading: templesLoading } = useTemples();
  const { location, loading: locationLoading } = useLocation();

  const [nearbyTemples, setNearbyTemples] = useState<(Temple & { distance: number })[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [scanCategory, setScanCategory] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const radarScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      startRadarAnimation();
    }, [temples])
  );

  const startRadarAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarScale, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(radarScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (location) {
      loadNearbyTemples();
    }
  }, [location, temples]);

  const loadNearbyTemples = async () => {
    if (!location) return;
    try {
      setLoadingNearby(true);
      const nearby = await getNearbyTemples(
        location.coords.latitude,
        location.coords.longitude,
        50 // Discovery radar: 50km
      );

      const templesWithDistance = nearby.map(temple => {
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          temple.latitude || 0,
          temple.longitude || 0
        );
        return { ...temple, distance: dist };
      });

      templesWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyTemples(templesWithDistance);
    } catch (error) {
      console.error('Error loading nearby temples:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  // Haversine fallback for immediate distance check
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const navigateToDetail = (temple: Temple) => {
    router.push({
      pathname: '/pagoda-detail',
      params: {
        id: temple.id,
        name: temple.name,
        location: temple.location,
        description: temple.description,
        imageUrl: temple.imageUrl,
        category: temple.category,
        latitude: temple.latitude?.toString(),
        longitude: temple.longitude?.toString(),
        source: 'explore',
      }
    });
  };

  const navigateToDiscoveryDetail = (item: DiscoveryItem) => {
    router.push({
      pathname: '/pagoda-detail',
      params: {
        id: item.id,
        name: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
        source: 'explore',
      }
    });
  };

  const handleCategoryDiscovery = async (catId: string) => {
    if (isScanning) return;

    setIsScanning(true);
    setScanCategory(catId);
    setDiscoveryResults([]);

    // Smooth Haptic feedback for starting scan
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate Radar scan duration (1.5s)
    setTimeout(() => {
      let results: any[] = [];
      if (catId === 'ancient') {
        if (nearbyTemples.length > 0) {
          results = [...nearbyTemples].sort(() => 0.5 - Math.random()).slice(0, 5);
        } else if (temples && temples.length > 0) {
          // Filter to only include temples with coordinates as a fallback
          const templesWithCoords = temples.filter(t => t.latitude && t.longitude);
          if (templesWithCoords.length > 0) {
            results = [...templesWithCoords].sort(() => 0.5 - Math.random()).slice(0, 5);
          } else {
            results = [...temples].sort(() => 0.5 - Math.random()).slice(0, 5);
          }
        }
      } else {
        const categoryMap: Record<string, string> = {
          'ancient': 'culture',
          'peaceful': 'culture',
          'festival': 'cuisine',
          'culture': 'education',
          'cuisine': 'challenges',
          'education': 'games'
        };
        const serviceKey = categoryMap[catId] || 'culture';
        results = getDiscoveryItems(serviceKey, 5);
      }

      setDiscoveryResults(results);
      setIsScanning(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1500);
  };

  const handleRadarRandom = () => {
    if ((discoveryResults.length === 0 && nearbyTemples.length === 0) || isScanning) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const itemsToPickFrom = discoveryResults.length > 0 ? discoveryResults : nearbyTemples;
    if (itemsToPickFrom.length === 0) return;

    const randomIndex = Math.floor(Math.random() * itemsToPickFrom.length);
    const item = itemsToPickFrom[randomIndex];
    
    if (item.category === 'ancient') {
      navigateToDetail(item);
    } else {
      navigateToDiscoveryDetail(item);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.quizHeader}>
        <ThemedText style={styles.headerTitle}>Khám phá</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Hành trình khám phá di sản văn hóa Khmer</ThemedText>
      </View>

      <View style={styles.content}>
        {/* Radar Section */}
        <Animated.View style={[styles.radarSection, { opacity: fadeAnim }]}>
          <View style={styles.radarHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Radar khám phá</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                {isScanning
                  ? 'Đang quét dữ liệu...'
                  : (scanCategory === 'ancient' || !scanCategory)
                    ? 'Tìm kiếm các ngôi chùa Khmer trong 50km'
                    : scanCategory === 'peaceful'
                      ? 'Khám phá nét đẹp văn hóa truyền thống'
                      : scanCategory === 'festival'
                        ? 'Tìm kiếm hương vị ẩm thực đặc sắc'
                        : scanCategory === 'culture'
                          ? 'Học ngôn ngữ và chữ viết Khmer'
                          : scanCategory === 'cuisine'
                            ? 'Thử thách kiến thức và kỹ năng'
                            : 'Giải trí với các trò chơi dân gian'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.radarContainer}>
            <Animated.View style={[styles.radarRing, { transform: [{ scale: radarScale }] }]} />
            <TouchableOpacity
              style={[
                styles.radarCenter,
                isScanning && { borderColor: '#ff6b57', borderWidth: 3, shadowColor: '#ff6b57' }
              ]}
              onPress={handleRadarRandom}
              activeOpacity={0.7}
              disabled={isScanning}
            >
              {loadingNearby || isScanning ? (
                <ActivityIndicator color="#ff6b57" />
              ) : (
                <View style={styles.radarContent}>
                  {scanCategory ? (
                    <>
                      <ThemedText style={styles.radarNumber}>
                        {discoveryResults.length > 0
                          ? discoveryResults.length
                          : nearbyTemples.length > 0
                            ? nearbyTemples.length
                            : 0}
                      </ThemedText>
                      <ThemedText style={styles.radarText}>
                        {discoveryResults.length > 0 ? 'KẾT QUẢ' : 'ĐIỂM ĐẾN'}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText style={[styles.radarNumber, { color: '#ddd', fontSize: 40 }]}>?</ThemedText>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Thematic Collections - Discovery Grid */}
        <View style={styles.collectionsSection}>
          <ThemedText style={styles.sectionTitle}>Khám phá theo danh mục</ThemedText>
          <View style={styles.orbGrid}>
            {DISCOVERY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.orbItem,
                  scanCategory === cat.id && { transform: [{ scale: 1.1 }] }
                ]}
                onPress={() => handleCategoryDiscovery(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.orbImageContainer,
                  scanCategory === cat.id && { borderColor: '#ff6b57', borderWidth: 2 }
                ]}>
                  <ImageBackground source={cat.image} style={styles.orbImage} imageStyle={{ borderRadius: 52.5 }}>
                    <View style={styles.orbOverlay} />
                  </ImageBackground>
                </View>
                <ThemedText style={[
                  styles.orbTitle,
                  scanCategory === cat.id && { color: '#ff6b57', fontWeight: '800' }
                ]}>{cat.title}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  quizHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 5,
    lineHeight: 36,
    includeFontPadding: true,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  radarSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  radarHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d2d2d',
    textAlign: 'center',
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  radarContainer: {
    width: width * 0.50,
    height: width * 0.50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.50) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 87, 0.2)',
    backgroundColor: 'rgba(255, 107, 87, 0.05)',
  },
  radarCenter: {
    width: 100,
    height: 100,
    borderRadius: 20, // Chuyển từ tròn sang vuông bo góc
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b57',
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  radarContent: {
    alignItems: 'center',
  },
  radarNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ff6b57',
    lineHeight: 32,
  },
  radarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0,
    marginTop: 0,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 18,
  },
  collectionsSection: {
    paddingHorizontal: 20,
  },
  orbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    marginHorizontal: -10,
  },
  orbItem: {
    alignItems: 'center',
    width: '31%',
    marginBottom: 25,
    marginHorizontal: '1%',
  },
  orbImageContainer: {
    width: 105,
    height: 105,
    borderRadius: 16, // Hình vuông bo góc
    borderWidth: 1.5,
    borderColor: '#ff6b57',
    padding: 2,
    marginBottom: 8,
    backgroundColor: '#fff',
    overflow: 'hidden', // Đảm bảo hình ảnh không chờm ra ngoài
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14, // Nhỏ hơn container một chút
  },
  orbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  orbTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
});