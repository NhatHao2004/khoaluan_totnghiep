import { ThemedText } from '@/components/themed-text';
import { useLocation } from '@/hooks/use-location';
import { useTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getNearbyTemples, Temple } from '@/services/firebase-service';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

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

export default function ExploreScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const { temples, loading: templesLoading } = useTemples();
  const { location, loading: locationLoading } = useLocation();
  
  const [nearbyTemples, setNearbyTemples] = useState<(Temple & { distance: number })[]>([]);
  const [allTemples, setAllTemples] = useState<Temple[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Load nearby temples when location is available
  useEffect(() => {
    if (location) {
      // Delay để không block UI
      const timer = setTimeout(() => {
        loadNearbyTemples();
      }, 100);
      return () => clearTimeout(timer);
    }
    if (temples) {
      // Sort temples alphabetically by name (A-Z)
      const sortedTemples = [...temples].sort((a, b) => {
        const nameA = normalizeText(a.name);
        const nameB = normalizeText(b.name);
        return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
      });
      setAllTemples(sortedTemples);
    }
  }, [location, temples]);

  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd');
  };

  const loadNearbyTemples = async () => {
    if (!location) return;

    try {
      setLoadingNearby(true);
      const nearby = await getNearbyTemples(
        location.coords.latitude,
        location.coords.longitude,
        50 // Giảm từ 100km xuống 50km để nhanh hơn
      );
      
      // Cập nhật khoảng cách đường đi thực tế từ OSRM API
      const templesWithRealDistance = await Promise.all(
        nearby.map(async (temple) => {
          try {
            const url = `https://router.project-osrm.org/route/v1/car/${location.coords.longitude},${location.coords.latitude};${temple.longitude},${temple.latitude}?overview=false`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              const realDistance = data.routes[0].distance / 1000; // Convert to km
              return { ...temple, distance: realDistance };
            }
            return temple; // Fallback to straight line distance
          } catch (error) {
            console.error('Error fetching route for temple:', temple.name, error);
            return temple; // Fallback to straight line distance
          }
        })
      );
      
      // Sắp xếp lại theo khoảng cách thực tế
      templesWithRealDistance.sort((a, b) => a.distance - b.distance);
      setNearbyTemples(templesWithRealDistance);
    } catch (error) {
      console.error('Error loading nearby temples:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  const navigateToDirections = (temple: Temple) => {
    router.push({
      pathname: '/directions',
      params: {
        id: temple.id,
        name: temple.name,
        location: temple.location || temple.rental,
        rental: temple.rental,
        description: temple.description,
        imageUrl: temple.imageUrl,
        category: temple.category,
        latitude: temple.latitude?.toString(),
        longitude: temple.longitude?.toString(),
        source: 'explore',
      }
    });
  };

  const navigateToDetail = (temple: Temple) => {
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
        isFavorite: temple.isFavorite?.toString(),
        latitude: temple.latitude?.toString(),
        longitude: temple.longitude?.toString(),
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Khám phá</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Tìm hiểu các ngôi chùa Khmer</ThemedText>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nearby Temples Section */}
        {location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Địa điểm gần bạn</ThemedText>
            </View>

            {locationLoading || loadingNearby ? (
              <View style={styles.loadingNearby}>
                <ActivityIndicator size="small" color={tintColor} />
                <ThemedText style={styles.loadingText}>Đang tìm các ngôi chùa gần bạn...</ThemedText>
              </View>
            ) : nearbyTemples.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                Không tìm thấy chùa nào gần bạn
              </ThemedText>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {nearbyTemples.slice(0, 3).map((temple) => (
                  <TouchableOpacity 
                    key={temple.id} 
                    style={styles.nearbyCard}
                    onPress={() => navigateToDirections(temple)}
                  >
                    <Image
                      source={temple.imageUrl ? 
                        { uri: `${temple.imageUrl}?t=${Date.now()}`, cache: 'reload' } : 
                        getPagodaImage(temple.id || '', temple.name)
                      }
                      style={styles.nearbyCardImage}
                      resizeMode="cover"
                    />
                    
                    <View style={styles.nearbyCardContent}>
                      <View style={styles.nearbyCardRow}>
                        <ThemedText style={styles.nearbyCardTitle} numberOfLines={1}>
                          {temple.name}
                        </ThemedText>
                        <ThemedText style={styles.nearbyCardDistance}>
                          📍 {temple.distance.toFixed(1)} km
                        </ThemedText>
                      </View>
                    </View>
                    
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* All Temples Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Tất cả ngôi chùa Khmer</ThemedText>
          </View>

          {templesLoading ? (
            <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
          ) : allTemples.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Chưa có dữ liệu chùa Khmer
            </ThemedText>
          ) : (
            <View style={styles.templeGrid}>
              {allTemples.map((temple) => (
                <TouchableOpacity 
                  key={temple.id} 
                  style={styles.templeCard}
                  onPress={() => navigateToDirections(temple)}
                >
                  <Image
                    source={temple.imageUrl ? 
                      { uri: `${temple.imageUrl}?t=${Date.now()}`, cache: 'reload' } : 
                      getPagodaImage(temple.id || '', temple.name)
                    }
                    style={styles.templeCardImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.templeCardContent}>
                    <ThemedText style={styles.templeCardTitle} numberOfLines={2}>
                      {temple.name}
                    </ThemedText>
                    <ThemedText style={styles.templeCardLocation} numberOfLines={1}>
                      {temple.location}
                    </ThemedText>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.templeDirectionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigateToDirections(temple);
                    }}
                  >
                    <ThemedText style={styles.directionIcon}>→</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
  },
  scrollContent: {
    paddingBottom: 55,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  horizontalScroll: {
    marginHorizontal: -10,
  },
  nearbyCard: {
    width: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  nearbyCardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  nearbyCardContent: {
    padding: 12,
  },
  nearbyCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nearbyCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
    flex: 1,
  },
  nearbyCardDistance: {
    fontSize: 12,
    color: '#ff6b57',
    fontWeight: '500',
  },
  nearbyDirectionBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templeGrid: {
    gap: 15,
  },
  templeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  templeCardImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  templeCardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  templeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: 5,
  },
  templeCardLocation: {
    fontSize: 14,
    color: '#666666',
  },
  templeDirectionBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionIcon: {
    fontSize: 16,
    color: '#ff6b57',
  },
  loader: {
    marginVertical: 20,
  },
  loadingNearby: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});