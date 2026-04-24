import PagodaContentSection from '@/components/pagoda-content-section';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Temple, toggleFavorite } from '@/services/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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

export default function PagodaDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const tintColor = useThemeColor({}, 'tint');

  const { temples, loading: templesLoading } = useTemples();

  const extractTempleFromParams = (dbTemples: any[] = []) => {
    const templeId = (params.id || params.templeId) as string;
    const dbTemple = dbTemples.find(t => t.id === templeId);

    let parsedAdditionalImages = undefined;
    let parsedDetailedDescription = undefined;

    try {
      if (params.additionalImages) {
        parsedAdditionalImages = JSON.parse(params.additionalImages as string);
      }
      if (params.detailedDescription) {
        parsedDetailedDescription = JSON.parse(params.detailedDescription as string);
      }
    } catch (e) {
      console.warn("Could not parse extended params", e);
    }

    return {
      id: templeId,
      name: (params.name as string) || dbTemple?.name || '',
      location: (params.location as string) || dbTemple?.location || dbTemple?.rental || '',
      rental: (params.rental as string) || dbTemple?.rental || '',
      description: (params.description as string) || dbTemple?.description || '',
      imageUrl: (params.imageUrl as string) || dbTemple?.imageUrl || '',
      category: (params.category as string) || dbTemple?.category || '',
      isFavorite: params.isFavorite === 'true' || dbTemple?.isFavorite,
      latitude: (params.latitude && params.latitude !== 'undefined')
        ? parseFloat(params.latitude as string)
        : dbTemple?.latitude,
      longitude: (params.longitude && params.longitude !== 'undefined')
        ? parseFloat(params.longitude as string)
        : dbTemple?.longitude,
      additionalImages: parsedAdditionalImages || dbTemple?.additionalImages,
      detailedDescription: parsedDetailedDescription || dbTemple?.detailedDescription,
    };
  };

  const [temple, setTemple] = useState<Temple>(() => extractTempleFromParams(temples));
  const [isFavorite, setIsFavorite] = useState(temple.isFavorite || false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync state when Firestore data arrives or navigation parameters change
  // Tự động cuộn lên đầu trang tức thì mỗi khi màn hình được tập trung
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // This is crucial for maintaining coordinates after login redirection
  useEffect(() => {
    const freshTemple = extractTempleFromParams(temples);

    // Only update state if necessary to prevent unnecessary flickers
    if (freshTemple.name !== temple.name || freshTemple.id !== temple.id) {
      setTemple(freshTemple);
    }

    setIsFavorite(freshTemple.isFavorite || false);
  }, [params.id, params.templeId, templesLoading]);

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Thông báo',
        'Đăng nhập để lưu địa điểm yêu thích.',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => router.push({
              pathname: '/login',
              params: {
                from: 'pagoda-detail',
                templeId: temple.id,
                source: params.source
              }
            })
          }
        ]
      );
      return;
    }

    try {
      const newFavoriteStatus = !isFavorite;
      await toggleFavorite(temple.id!, newFavoriteStatus);
      setIsFavorite(newFavoriteStatus);
      // Update the temple object to reflect the change
      temple.isFavorite = newFavoriteStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            // Sử dụng navigate để quay về trang danh sách và dọn dẹp các trang đã mở ở giữa (như Quiz)
            router.navigate('/pagoda');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>Chi tiết chùa</ThemedText>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <Image
              source={temple.imageUrl ?
                { uri: temple.imageUrl } :
                getPagodaImage(temple.id || '', temple.name)
              }
              style={styles.heroImage}
            />
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#ff1e00ff" : "#000000ff"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pagoda Info */}
        <View style={styles.pagodaInfo}>
          <View style={styles.pagodaInfoLeft}>
            <ThemedText style={styles.pagodaInfoTitle}>{temple.name}</ThemedText>
            {temple.category === 'ancient' && temple.location && (
              <View style={styles.pagodaInfoLocation}>
                <Ionicons name="location-outline" size={14} color="#9e9e9e" />
                <ThemedText style={styles.locationText}>{temple.location}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <PagodaContentSection temple={temple} />

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtons}>
            {(temple.latitude && !isNaN(temple.latitude) && temple.longitude && !isNaN(temple.longitude)) && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => {
                  router.push({
                    pathname: '/directions',
                    params: {
                      id: temple.id,
                      name: temple.name,
                      location: temple.location,
                      rental: temple.rental,
                      description: temple.description,
                      imageUrl: temple.imageUrl,
                      category: temple.category,
                      latitude: temple.latitude?.toString(),
                      longitude: temple.longitude?.toString(),
                      source: params.source || 'pagoda-detail',
                      isFavorite: temple.isFavorite?.toString(),
                    }
                  });
                }}
              >
                <Ionicons name="navigate" size={16} color="#ffffff" />
                <ThemedText style={styles.actionBtnText}>Chỉ đường</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => {
                // Chuẩn hóa tên để so sánh (xóa mọi khoảng trắng, không dấu, viết thường)
                const cleanName = temple?.name?.toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .replace(/\s+/g, ""); // Xóa hết khoảng trắng
                
                const isChuaAng = cleanName?.includes('ang');

                // Kiểm tra đăng nhập trước khi cho phép làm thử thách
                if (!user) {
                  Alert.alert(
                    'Yêu cầu đăng nhập',
                    'Đăng nhập để tham gia thử thách.',
                    [
                      { text: 'Để sau', style: 'cancel' },
                      { 
                        text: 'Đăng nhập', 
                        onPress: () => router.push({
                          pathname: '/login',
                          params: { 
                            from: isChuaAng ? 'do-quiz' : 'quiz',
                            quizId: isChuaAng ? 'PFB2JEcYku3tLlYwJPMK' : undefined,
                            templeId: temple.id,
                            source: 'pagoda-detail' 
                          }
                        }) 
                      }
                    ]
                  );
                  return;
                }

                // Nếu là Chùa Âng, dẫn thẳng tới bộ Quiz PFB2JEcYku3tLlYwJPMK
                if (isChuaAng) {
                  router.push({
                    pathname: '/do-quiz/[id]',
                    params: { 
                      id: 'PFB2JEcYku3tLlYwJPMK',
                      source: 'pagoda-detail',
                      templeId: temple.id
                    }
                  });
                } else {
                  // Các chùa khác vẫn về trang danh sách Quiz chung
                  router.push({
                    pathname: '/quiz',
                    params: {
                      source: 'pagoda-detail',
                      templeId: temple.id
                    }
                  });
                }
              }}
            >
              <Ionicons name="help-circle" size={16} color="#ffffff" />
              <ThemedText style={styles.actionBtnText}>Thử thách</ThemedText>
            </TouchableOpacity>
          </View>
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollableContent: {
    flex: 1,
    marginTop: 0,
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    height: 250,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  heroImageContainer: {
    position: 'relative',
    width: '90%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pagodaInfo: {
    padding: 20,
    paddingBottom: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 80,
  },
  pagodaInfoLeft: {
    flex: 1,
  },
  pagodaInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 8,
    lineHeight: 30,
  },
  pagodaInfoLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  contentSection: {
    padding: 20,
    paddingBottom: 100,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 27,
    color: '#555555',
    marginBottom: 15,
    textAlign: 'justify',
  },
  contentImage: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  contentImageStyle: {
    width: '80%',
    height: 180,
    resizeMode: 'cover',
  },
  imageCaption: {
    fontSize: 12,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  sectionTitleContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  featuresList: {
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
    color: '#2d2d2d',
  },
  featureDesc: {
    fontSize: 12,
    color: '#757575',
  },
  actionButtonsContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#ff6b57',
  },
  actionBtnSecondary: {
    backgroundColor: '#00bcd4',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});