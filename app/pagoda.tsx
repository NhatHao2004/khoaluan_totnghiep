import { ThemedText } from '@/components/themed-text';
import { useTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { toggleFavorite } from '@/services/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Local images for pagodas
const PAGODA_IMAGES = {
  'chua-ang': require('@/assets/images/chuaang1.jpg'),
  'chua-hang': require('@/assets/images/chuahang.jpg'),
  'chua-sleng-cu': require('@/assets/images/chuaslengcu.jpg'),
  'default': require('@/assets/images/chua1.jpg'),
};

// Function to get pagoda image
const getPagodaImage = (templeId: string, templeName: string) => {
  // Try to match by ID first
  if (PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES]) {
    return PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES];
  }
  
  // Try to match by name
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

export default function PagodaScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const { temples, loading, error, refresh } = useTemples();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Navigation helper
  const handleBackPress = () => {
    // Navigate to home tab specifically
    router.push('/');
  };

  // Search functionality
  const handleSearchPress = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery(''); // Clear search when hiding
    }
  };

  const handleClearSearch = () => {
    if (searchQuery.trim()) {
      setSearchQuery(''); // Clear search query but keep search input visible
    } else {
      setShowSearchInput(false); // Hide search input if already empty
    }
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

  // Tối ưu: Bỏ tự động refresh mỗi khi focus để ngăn chặn component Image bị load lại (cà giật).
  // Hệ thống sẽ chỉ lấy dữ liệu mới khi User chủ động vuốt Pull-to-refresh.

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, !currentStatus);
      refresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


  // Filter only pagoda/temple category
  const pagodas = temples.filter(temple => 
    temple.category === 'Chùa Khmer' || 
    temple.category === 'pagoda' || 
    temple.name.toLowerCase().includes('chùa')
  );

  // Filter by search query and sort alphabetically
  const filteredPagodas = pagodas
    .filter(pagoda => {
      if (!searchQuery.trim()) return true;
      
      const normalizedQuery = normalizeText(searchQuery);
      const normalizedName = normalizeText(pagoda.name);
      const normalizedLocation = normalizeText(pagoda.rental || pagoda.location || '');
      
      return normalizedName.includes(normalizedQuery) || 
             normalizedLocation.includes(normalizedQuery);
    })
    .sort((a, b) => {
      // Sort by temple name alphabetically (A-Z)
      const nameA = normalizeText(a.name);
      const nameB = normalizeText(b.name);
      return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        
        {showSearchInput ? (
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm chùa..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.clearBtn}
              onPress={handleClearSearch}
            >
              <Ionicons 
                name={searchQuery.trim() ? "close-circle" : "close"} 
                size={18} 
                color={searchQuery.trim() ? "#ff6b57" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ThemedText style={styles.headerTitle}>Chùa Khmer</ThemedText>
            <TouchableOpacity 
              style={styles.searchBtn}
              onPress={handleSearchPress}
            >
              <Ionicons name="search" size={20} color="#000000" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <ThemedText style={styles.searchResultsText}>
              Tìm thấy {filteredPagodas.length} kết quả cho "{searchQuery}" (A-Z)
            </ThemedText>
          </View>
        )}
        

        {loading ? (
          <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.errorText}>
            Không thể tải dữ liệu chùa Khmer
          </ThemedText>
        ) : filteredPagodas.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            {searchQuery.trim() ? 
              `Không tìm thấy chùa nào với từ khóa "${searchQuery}"` : 
              'Chưa có dữ liệu chùa Khmer'
            }
          </ThemedText>
        ) : (
          <View style={styles.pagodaList}>
            {filteredPagodas.map((pagoda) => (
              <TouchableOpacity 
                key={pagoda.id} 
                style={styles.pagodaCard}
                onPress={() => router.push({
                  pathname: '/pagoda-detail',
                  params: {
                    id: pagoda.id,
                    name: pagoda.name,
                    location: pagoda.location,
                    rental: pagoda.rental,
                    description: pagoda.description,
                    imageUrl: pagoda.imageUrl,
                    category: pagoda.category,
                    isFavorite: pagoda.isFavorite?.toString(),
                    latitude: pagoda.latitude?.toString(),
                    longitude: pagoda.longitude?.toString(),
                    // Pass extended fields as JSON strings
                    detailedDescription: pagoda.detailedDescription ? 
                      JSON.stringify(pagoda.detailedDescription) : undefined,
                    additionalImages: pagoda.additionalImages ? 
                      JSON.stringify(pagoda.additionalImages) : undefined,
                  }
                })}
              >
                <View style={styles.pagodaImageContainer}>
                  <Image
                    source={pagoda.imageUrl ? 
                      { uri: pagoda.imageUrl } : 
                      getPagodaImage(pagoda.id || '', pagoda.name)
                    }
                    style={styles.pagodaImage}
                    resizeMode="cover"
                    // Tối ưu: Tắt fadeDuration và bỏ loadingIndicatorSource để ngăn chớp khung hình
                    fadeDuration={0}
                  />
                  
                </View>
                
                <View style={styles.pagodaContent}>
                  <ThemedText style={styles.pagodaName}>{pagoda.name}</ThemedText>
                  <ThemedText style={styles.pagodaLocation}>
                    {pagoda.location}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  headerTitle: {
    flex: 1,
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'left',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000',
    paddingRight: 40, // Make space for clear button
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  pagodaList: {
    gap: 10,
    marginTop: 15,
  },
  pagodaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 15,
  },
  pagodaImageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  pagodaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 8,
  },
  cardFavoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 35,
    height: 35,
    backgroundColor: '#ffffff',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  pagodaContent: {
    padding: 15,
  },
  pagodaName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2d2d2d',
  },
  pagodaLocation: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 40,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  searchResultsInfo: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  sortInfo: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#d4edda',
  },
  sortText: {
    fontSize: 13,
    color: '#155724',
    fontWeight: '500',
  },
});