import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUserScore } from '@/hooks/use-quiz';
import { useFavoriteTemples } from '@/hooks/use-temples';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { favorites, loading, refresh } = useFavoriteTemples(); // Lấy cả refresh function
  
  // Temporary user ID - in production, get from auth
  const TEMP_USER_ID = 'user_demo_001';
  const { progress, loading: progressLoading, refresh: refreshProgress } = useUserScore(TEMP_USER_ID);

  // Timeout để tránh loading vô hạn
  const [showFallback, setShowFallback] = useState(false);
  
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
    }, []) // Không depend vào refresh functions để tránh vòng lặp
  );

  const handleMenuPress = (item: string) => {
    console.log('Menu pressed:', item);
    // TODO: Navigate to respective screens
    switch (item) {
      case 'settings':
        // router.push('/settings');
        break;
      case 'saved':
        // router.push('/saved-locations');
        break;
      case 'notifications':
        // router.push('/notifications');
        break;
      case 'about':
        // router.push('/about');
        break;
      case 'logout':
        // Handle logout
        break;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Hồ sơ</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Thông tin cá nhân và cài đặt</ThemedText>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarPlaceholder}>👤</ThemedText>
            </View>
            <View style={styles.statusDot} />
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.name} numberOfLines={2}>
              Nguyễn Văn A
            </ThemedText>
            <ThemedText style={styles.email}>nguyenvana@gmail.com</ThemedText>
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
            onPress={() => handleMenuPress('settings')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#667eea' }]}>
              <Ionicons name="settings-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Cài đặt</ThemedText>
              <ThemedText style={styles.menuSubtext}>Tùy chỉnh ứng dụng</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('saved')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ff6b57' }]}>
              <Ionicons name="bookmark-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Địa điểm đã lưu</ThemedText>
              <ThemedText style={styles.menuSubtext}>Quản lý danh sách yêu thích</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('notifications')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#4caf50' }]}>
              <Ionicons name="notifications-outline" size={20} color="white" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Thông báo</ThemedText>
              <ThemedText style={styles.menuSubtext}>Cài đặt thông báo</ThemedText>
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
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    fontSize: 48,
    color: 'white',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
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
    flexWrap: 'wrap', // Cho phép xuống dòng
    maxWidth: '100%', // Đảm bảo không vượt quá container
    lineHeight: 32, // Tăng line height để hiển thị đầy đủ dấu
    includeFontPadding: true, // Android: bao gồm font padding
  },
  email: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
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
