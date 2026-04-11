import { ThemedText } from '@/components/themed-text';
import { useLocation } from '@/hooks/use-location';
import { useFavoriteTemples, useTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getNearbyTemples, Temple, toggleFavorite } from '@/services/firebase-service';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const categories = [
  { id: 1, icon: require('@/assets/images/icon.png'), label: 'Chùa Khmer' },
  { id: 2, icon: require('@/assets/images/icon.png'), label: 'Văn hóa' },
  { id: 3, icon: require('@/assets/images/icon.png'), label: 'Ẩm thực' },
  { id: 4, icon: require('@/assets/images/icon.png'), label: 'Điểm đến' },
  { id: 5, icon: require('@/assets/images/icon.png'), label: 'Cộng đồng' },
  { id: 6, icon: require('@/assets/images/icon.png'), label: 'Học tiếng Khmer' },
  { id: 7, icon: require('@/assets/images/icon.png'), label: 'Thử thách' },
  { id: 8, icon: require('@/assets/images/icon.png'), label: 'Trò chơi\ndân gian' },
];

export default function HomeScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Fetch data from Firebase
  const { temples, loading: templesLoading, error: templesError, refresh: refreshTemples } = useTemples();
  const { favorites, loading: favoritesLoading, error: favoritesError, refresh: refreshFavorites } = useFavoriteTemples();
  
  // Get user location
  const { location, loading: locationLoading, error: locationError } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyTemples, setNearbyTemples] = useState<(Temple & { distance: number })[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  
  // Animation for logo
  const [logoAnim] = useState(new Animated.Value(0));

  // Load nearby temples when location is available
  useEffect(() => {
    if (location) {
      loadNearbyTemples();
    }
  }, [location]);

  // Animate logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadNearbyTemples = async () => {
    if (!location) return;
    
    try {
      setLoadingNearby(true);
      const nearby = await getNearbyTemples(
        location.coords.latitude,
        location.coords.longitude,
        50 // 50km radius
      );
      setNearbyTemples(nearby.slice(0, 3)); // Show top 3 nearest
    } catch (error) {
      console.error('Error loading nearby temples:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, !currentStatus);
      // Refresh both lists
      refreshTemples();
      refreshFavorites();
      if (location) {
        loadNearbyTemples();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with background image */}
      <ImageBackground
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerTop}>
            <View style={styles.greeting}>
              <ThemedText style={styles.appName}>KhmerGo</ThemedText>
              <ThemedText style={styles.tagline}>Khám phá văn hóa Khmer</ThemedText>
            </View>
          </View>
          
          {/* Animated Logo */}
          <Animated.Image
            source={require('@/assets/images/icon.png')}
            style={[
              styles.headerLogo,
              {
                transform: [
                  {
                    translateX: logoAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 250, 0],
                    }),
                  },
                  {
                    scaleX: logoAnim.interpolate({
                      inputRange: [0, 0.45, 0.5, 0.95, 1],
                      outputRange: [1, 1, -1, -1, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Tìm kiếm"
                placeholderTextColor="#9e9e9e"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.serviceItem}>
                <View style={styles.serviceIcon}>
                  <Image source={category.icon} style={styles.serviceIconImage} />
                </View>
                <ThemedText style={styles.serviceText}>{category.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorites Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Danh mục yêu thích</ThemedText>
          </View>
          
          {favoritesLoading ? (
            <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
          ) : favoritesError ? (
            <ThemedText style={styles.errorText}>
              Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Firebase.
            </ThemedText>
          ) : favorites.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Chưa có danh mục yêu thích
            </ThemedText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {favorites.map((item) => (
                <TouchableOpacity key={item.id} style={styles.featuredCard}>
                  <TouchableOpacity 
                    style={styles.cardFavorite}
                    onPress={() => handleToggleFavorite(item.id!, item.isFavorite || false)}
                  >
                    <ThemedText style={styles.heartIcon}>
                      {item.isFavorite ? '❤️' : '🤍'}
                    </ThemedText>
                  </TouchableOpacity>
                  <Image 
                    source={require('@/assets/images/partial-react-logo.png')} 
                    style={styles.featuredCardImage}
                  />
                  <View style={styles.featuredCardContent}>
                    <ThemedText style={styles.featuredCardTitle}>{item.name}</ThemedText>
                    <ThemedText style={styles.featuredCardSubtitle}>
                      {item.rental || item.location || 'Chưa có địa chỉ'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Nearby Places Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <ThemedText style={styles.mapTitle}>Địa điểm gần bạn</ThemedText>
          </View>
          
          {locationLoading || loadingNearby ? (
            <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
          ) : locationError ? (
            <ThemedText style={styles.errorText}>
              {locationError}. Vui lòng bật GPS và cấp quyền truy cập vị trí.
            </ThemedText>
          ) : nearbyTemples.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Không tìm thấy địa điểm nào gần bạn (trong bán kính 50km)
            </ThemedText>
          ) : (
            <View style={styles.nearbyPlaces}>
              {nearbyTemples.map((item) => (
                <TouchableOpacity key={item.id} style={styles.placeItem}>
                  <Image 
                    source={require('@/assets/images/partial-react-logo.png')} 
                    style={styles.placeImage}
                  />
                  <View style={styles.placeInfo}>
                    <ThemedText style={styles.placeTitle}>{item.name}</ThemedText>
                    <ThemedText style={styles.placeDistance}>
                      📍 {item.distance.toFixed(1)} km
                    </ThemedText>
                  </View>
                  <TouchableOpacity style={styles.directionBtn}>
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
    backgroundColor: '#ffffff',
  },
  header: {
    height: 220,
    position: 'relative',
  },
  headerImage: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerOverlay: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(232, 180, 184, 0.8)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  greeting: {
    flex: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  headerLogo: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginBottom: 10,
  },
  searchContainer: {
    marginTop: 'auto',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2d2d2d',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  servicesSection: {
    backgroundColor: '#ffffff',
    padding: 18,
    paddingBottom: 15,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  serviceIconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  serviceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b6b6b',
    textAlign: 'center',
    lineHeight: 14,
  },
  featuredSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  featuredScroll: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 8,
    marginRight: 15,
    position: 'relative',
  },
  cardFavorite: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 38,
    height: 38,
    backgroundColor: 'white',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
  featuredCardImage: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    marginBottom: 8,
  },
  featuredCardContent: {
    paddingHorizontal: 5,
    paddingBottom: 3,
  },
  featuredCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 3,
  },
  featuredCardSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9e9e9e',
  },
  mapSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 100,
  },
  mapHeader: {
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  nearbyPlaces: {
    gap: 10,
  },
  placeItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  placeDistance: {
    fontSize: 11,
    color: '#9e9e9e',
  },
  directionBtn: {
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
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
    fontSize: 13,
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
    padding: 20,
    fontSize: 13,
  },
});
