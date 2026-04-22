import PagodaContentSection from '@/components/pagoda-content-section';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getTemples, Temple, toggleFavorite } from '@/services/firebase-service';
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

  const extractTempleFromParams = () => {
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
      id: params.id as string,
      name: params.name as string,
      location: params.location as string,
      rental: params.rental as string,
      description: params.description as string,
      imageUrl: params.imageUrl as string,
      category: params.category as string,
      isFavorite: params.isFavorite === 'true',
      latitude: params.latitude ? parseFloat(params.latitude as string) : undefined,
      longitude: params.longitude ? parseFloat(params.longitude as string) : undefined,
      additionalImages: parsedAdditionalImages,
      detailedDescription: parsedDetailedDescription,
    };
  };

  const [temple, setTemple] = useState<Temple>(extractTempleFromParams);
  const [isFavorite, setIsFavorite] = useState(temple.isFavorite || false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Ép cập nhật lại toàn bộ state khi người dùng bấm sang một ngổi chùa khác
  useEffect(() => {
    const freshTemple = extractTempleFromParams();
    setTemple(freshTemple);
    setIsFavorite(freshTemple.isFavorite || false);

    // Reset thanh cuộn lên đầu cùng màn hình
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [params.id]);

  // Thiết lập delay nhẹ và chỉ cập nhật state cụ thể (tránh load đè toàn bộ object gây giật ảnh)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadTempleData = async () => {
        try {
          // Delay load API để màn hình chuyển trang mượt mà ngay lập tức
          await new Promise(resolve => setTimeout(resolve, 300));
          if (!isActive) return;

          const temples = await getTemples();
          const updatedTemple = temples.find((t: Temple) => t.id === params.id);
          if (updatedTemple && isActive) {
            // Chỉ cập nhật trạng thái Favorite, không ghi đè lại toàn bộ state `temple`
            // để tránh bức ảnh chính bị render lại dẫn tới chớp giật 
            setIsFavorite(updatedTemple.isFavorite || false);
          }
        } catch (error) {
          console.error('Error loading temple data:', error);
        }
      };

      loadTempleData();
      return () => { isActive = false; };
    }, [params.id])
  );

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
                templeId: temple.id 
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
            if (params.source === 'explore') {
              router.push('/explore');
            } else if (params.source === 'pagoda') {
              router.push('/pagoda');
            } else {
              router.back();
            }
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

            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => {
                // Logic for Quiz/Challenge
                router.push('/quiz');
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