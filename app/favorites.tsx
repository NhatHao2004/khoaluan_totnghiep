import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavoriteTemples } from '@/hooks/use-temples';
import { toggleFavorite } from '@/services/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, loading, error, refresh } = useFavoriteTemples();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Đơn giản hóa logic - không dùng timeout phức tạp
  const [showMockData, setShowMockData] = useState(false);
  
  // Sau 4 giây nếu vẫn loading thì hiển thị mock data
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          setShowMockData(true);
          console.log('⏰ Showing mock data due to timeout');
        }
      }, 4000);
      
      return () => clearTimeout(timer);
    } else {
      setShowMockData(false);
    }
  }, [loading]);

  const handleBackPress = () => {
    router.push('/');
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Hide search input and clear search query when refreshing
    if (showSearchInput) {
      setShowSearchInput(false);
      setSearchQuery('');
    }
    
    // Reset mock data
    setShowMockData(false);
    
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, !currentStatus);
      refresh(); // Refresh data after toggle
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleItemPress = (item: any) => {
    router.push({
      pathname: '/pagoda-detail',
      params: {
        id: item.id,
        name: item.name,
        location: item.location,
        rental: item.rental,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
        isFavorite: item.isFavorite?.toString(),
        latitude: item.latitude?.toString(),
        longitude: item.longitude?.toString(),
      }
    });
  };

  // Debug: Log dữ liệu để kiểm tra
  useEffect(() => {
    console.log('🔍 Favorites Debug:', {
      favoritesCount: favorites.length,
      loading,
      error: error?.message,
      favorites: favorites.map(f => ({ id: f.id, name: f.name, isFavorite: f.isFavorite }))
    });
  }, [favorites, loading, error]);

  // Logic hiển thị data với search
  const filteredFavorites = (favorites.length > 0 ? favorites : [])
    .filter(item => {
      if (!searchQuery.trim()) return true;
      
      const normalizedQuery = normalizeText(searchQuery);
      const normalizedName = normalizeText(item.name);
      const normalizedLocation = normalizeText(item.rental || item.location || '');
      
      return normalizedName.includes(normalizedQuery) || 
             normalizedLocation.includes(normalizedQuery);
    })
    .sort((a, b) => {
      // Sort by name alphabetically (A-Z)
      const nameA = normalizeText(a.name);
      const nameB = normalizeText(b.name);
      return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
    });

  const shouldShowLoading = loading && !showMockData;

  // Use favorites directly (no mock data logic needed)
  // const displayFavorites = favorites;

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Auto refresh on focus...');
      
      // Reset and animate entrance
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Chỉ refresh nếu không có data hoặc có lỗi
      if (favorites.length === 0 || error) {
        const timer = setTimeout(() => {
          if (refreshRef.current) {
            refreshRef.current();
          }
        }, 300); // Delay ngắn hơn
        
        return () => clearTimeout(timer);
      }
    }, [fadeAnim, slideAnim, favorites.length, error])
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Yêu thích</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Danh sách yêu thích của bạn</ThemedText>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
            colors={['#000000']} // Android
            progressBackgroundColor="#ffffff" // Android
          />
        }
      >
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <ThemedText style={styles.searchResultsText}>
              Tìm thấy {filteredFavorites.length} kết quả cho "{searchQuery}" (A-Z)
            </ThemedText>
          </View>
        )}

        {shouldShowLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorEmoji}>😔</ThemedText>
            <ThemedText style={styles.errorTitle}>Oops!</ThemedText>
            <ThemedText style={styles.errorText}>
              Không thể tải dữ liệu. Vui lòng thử lại.
            </ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : filteredFavorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>💝</ThemedText>
            <ThemedText style={styles.emptyTitle}>
              {searchQuery.trim() ? 
                `Không tìm thấy yêu thích nào với từ khóa "${searchQuery}"` :
                'Không có yêu thích'
              }
            </ThemedText>
            <View style={styles.emptyHint}>
              <ThemedText style={styles.emptyHintText}>
                Nhấn ❤️ để thêm vào yêu thích
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            {filteredFavorites.map((item: any) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.cardContent}>
                  {/* Temple Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.imageUrl ? 
                        { uri: item.imageUrl } : 
                        require('@/assets/images/chua1.jpg')
                      }
                      style={styles.templeImage}
                      contentFit="cover"
                    />
                  </View>
                  
                  {/* Temple Info */}
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </ThemedText>
                    
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <ThemedText style={styles.location} numberOfLines={1}>
                        {item.rental || item.location}
                      </ThemedText>
                    </View>
                  </View>
                  
                  {/* Favorite Button */}
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(item.id, item.isFavorite)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name="heart" 
                      size={24} 
                      color="#ff6b57" 
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles (giống explore.tsx)
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
  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Search Results Info
  searchResultsInfo: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },

  // Debug Info
  debugInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#1976d2',
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500, // Đảm bảo có đủ chiều cao để căn giữa
    paddingVertical: 80, // Thêm padding dọc
    marginVertical: 40, // Thêm margin dọc
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24, // Thêm line height
    paddingHorizontal: 20, // Thêm padding ngang
  },

  // Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500, // Đảm bảo có đủ chiều cao để căn giữa
    paddingVertical: 80, // Thêm padding dọc
    marginVertical: 40, // Thêm margin dọc
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b57',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500, // Tăng chiều cao tối thiểu
    paddingVertical: 80, // Thêm padding dọc
    marginVertical: 40, // Thêm margin dọc
  },
  emptyEmoji: {
    fontSize: 64, // Giảm từ 80 xuống 64
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 80, // Thêm line height để đảm bảo không bị cắt
    includeFontPadding: false, // Android: loại bỏ padding mặc định
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8, // Giảm từ 16 xuống 8
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32, // Tăng khoảng cách
    paddingHorizontal: 10, // Thêm padding ngang
  },
  emptyHint: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 8, // Giảm từ 16 xuống 8
    borderRadius: 20,
    marginTop: 4, // Giảm từ 8 xuống 4
  },
  emptyHintText: {
    fontSize: 14,
    color: '#718096', // Thay đổi màu text để phù hợp với nền trắng
    fontWeight: '600',
  },

  // Favorites List
  favoritesList: {
    gap: 12,
  },

  // Card Styles - Design mới đơn giản
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center', // Căn giữa tất cả elements theo chiều dọc
  },
  
  // Image Styles
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  templeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Bo tròn 4 góc giống với container
  },
  
  // Info Styles
  cardInfo: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center', // Căn giữa nội dung theo chiều dọc
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4, // Giảm margin để gần với location hơn
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  
  // Favorite Button
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 87, 0.1)',
  },
});