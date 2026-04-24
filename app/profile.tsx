import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useUserScore } from '@/hooks/use-quiz';
import { useFavoriteTemples } from '@/hooks/use-temples';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userData, loading: authLoading, logout, updateAvatar } = useAuth();
  const { favorites, loading, refresh } = useFavoriteTemples(user?.uid);

  const [uploading, setUploading] = useState(false);

  const { progress, loading: progressLoading, refresh: refreshProgress } = useUserScore(user?.uid);

  const scrollRef = useRef<ScrollView>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Cuộn lên đầu trang khi trạng thái đăng nhập thay đổi (đăng nhập hoặc đăng xuất thành công)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || progressLoading) {
        setShowFallback(true);
        console.log('⏰ Showing fallback data due to timeout');
      }
    }, 5000); // 5 giây timeout

    return () => clearTimeout(timer);
  }, [loading, progressLoading]);

  // Debug log để kiểm tra
  console.log('🔍 Profile Debug:', {
    favoritesCount: favorites.length,
    loading,
    totalScore: progress?.totalScore || 0,
    progressLoading,
    showFallback
  });

  // Auto refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Profile focused, refreshing data...');
      // Chỉ refresh một lần khi focus, không liên tục
      const timer = setTimeout(() => {
        if (refresh) {
          refresh();
        }
        if (refreshProgress) {
          refreshProgress();
        }
      }, 100); // Delay nhỏ để tránh conflict

      return () => clearTimeout(timer);
    }, [refresh, refreshProgress]) // Include refresh functions to ensure they are called correctly when focused
  );

  const handleMenuPress = (item: string) => {
    if (!user && item !== 'about') {
      Alert.alert(
        'Thông báo',
        'Đăng nhập để sử dụng tính năng này.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push({ pathname: '/login', params: { from: 'profile' } }) }
        ]
      );
      return;
    }

    switch (item) {
      case 'edit-profile':
        router.push('/edit-profile');
        break;
      case 'change-password':
        router.push('/change-password');
        break;
      case 'language':
        router.push('/language');
        break;
      case 'saved':
        router.push('/favorites');
        break;
      case 'notifications':
        Alert.alert('Thông báo', 'Bạn hiện chưa có thông báo nào.');
        break;
      case 'about':
        Alert.alert('Về ứng dụng', 'KhmerGo version 1.0.0.\nKhám phá văn hóa Khmer tại KhmerGo.');
        break;
      case 'logout':
        if (!user) {
          Alert.alert('Thông báo', 'Bạn chưa đăng nhập.');
          return;
        }
        Alert.alert(
          'Đăng xuất',
          'Bạn có muốn đăng xuất không.',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: async () => {
                try {
                  await logout();
                  Alert.alert('Thành công', 'Đã đăng xuất khỏi tài khoản của bạn.');
                } catch (error) {
                  Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
                }
              }
            }
          ]
        );
        break;
    }
  };

  const handlePickImage = async () => {
    if (!user) {
      Alert.alert(
        'Thông báo',
        'Đăng nhập để thay đổi ảnh đại diện.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push({ pathname: '/login', params: { from: 'profile' } }) }
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Tắt chế độ cắt ảnh như yêu cầu
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setUploading(true);
        await updateAvatar(result.assets[0].base64);
        // Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.'); 
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerTitle}>Hồ sơ</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Thông tin cá nhân và cài đặt</ThemedText>
        </View>

        {!user && !authLoading && (
          <TouchableOpacity
            style={styles.headerLoginBtn}
            onPress={() => router.push({
              pathname: '/login',
              params: { from: 'profile' }
            })}
          >
            <ThemedText style={styles.headerLoginBtnText}>Đăng nhập</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploading || !user}
            activeOpacity={user ? 0.8 : 1}
          >
            <View style={[
              styles.avatar,
              uploading && styles.avatarUploading,
              !user && styles.avatarGuest
            ]}>
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (userData?.photoURL || user?.photoURL) ? (
                <Image
                  source={{ uri: userData?.photoURL || user?.photoURL }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={50}
                  color="white"
                  style={{ marginTop: 10 }}
                />
              )}
            </View>
            {user && (
              <>
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color="white" />
                </View>
                <View style={styles.statusDot} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <ThemedText style={styles.name}>
              {user ? (userData?.fullName || user.displayName || 'Người dùng') : 'Khách'}
            </ThemedText>
            <ThemedText style={styles.email}>
              {user ? user.email : 'Đăng nhập để trải nghiệm tối ưu hơn'}
            </ThemedText>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {(loading && !showFallback) ? '...' : favorites.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Yêu thích</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {(progressLoading && !showFallback) ? '...' : (progress?.totalScore || 0)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Số điểm</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Cài đặt tài khoản</ThemedText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('edit-profile')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#03b000ff' }]}>
              <Ionicons name="person-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Đổi tên người dùng</ThemedText>
              <ThemedText style={styles.menuSubtext}>Chỉnh sửa tên hiển thị trong ứng dụng</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('change-password')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#0015ffff' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Đổi mật khẩu</ThemedText>
              <ThemedText style={styles.menuSubtext}>Cập nhật mật khẩu để tăng bảo mật</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('language')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#9c27b0' }]}>
              <Ionicons name="language-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Ngôn ngữ ứng dụng</ThemedText>
              <ThemedText style={styles.menuSubtext}>Đổi ngôn ngữ hiển thị (Việt / Khmer)</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

        </View>

        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Hỗ trợ</ThemedText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('about')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ff9800' }]}>
              <Ionicons name="information-circle-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Về ứng dụng</ThemedText>
              <ThemedText style={styles.menuSubtext}>Phiên bản 1.0.0</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => handleMenuPress('logout')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f44336' }]}>
              <Ionicons name="log-out-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Đăng xuất</ThemedText>
              <ThemedText style={styles.menuSubtext}>Thoát khỏi tài khoản</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    lineHeight: 38,
    includeFontPadding: false,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    includeFontPadding: false,
    lineHeight: 22,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLoginBtn: {
    backgroundColor: '#ff6b57',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexShrink: 0,
    marginLeft: 10,
  },
  headerLoginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },


  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60, // Giảm từ 100 xuống 80
  },

  // Profile Card Styles
  profileCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 24,
    marginBottom: 12, // Giảm từ 24 xuống 12
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 20, // Vuông bo góc
    overflow: 'hidden',
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGuest: {
    backgroundColor: '#3498db',
  },
  avatarUploading: {
    opacity: 0.7,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarPlaceholder: {
    fontSize: 48,
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: -5, // Điều chỉnh vị trí một chút cho đẹp
    right: -5,
    backgroundColor: '#ff6b57',
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  statusDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%', // Đảm bảo chiếm full width
    paddingHorizontal: 10, // Thêm padding để tránh sát mép
    paddingTop: 5, // Thêm padding top để tránh cắt dấu
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
    lineHeight: 34,
    includeFontPadding: false,
  },
  email: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 12,
  },
  guestLoginBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 20,
  },
  guestLoginBtnText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },

  // Menu Styles
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4, // Giảm từ 8 xuống 4
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#718096',
  },
});
