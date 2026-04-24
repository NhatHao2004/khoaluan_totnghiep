import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizCategories, useQuizzes, useUserQuizProgress, useUserScore } from '@/hooks/use-quiz';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Temporary user ID - in production, get from auth
const TEMP_USER_ID = 'user_demo_001';
const TEMP_USERNAME = 'Người dùng KhmerGo';

export default function QuizScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const { user, loading: authLoading } = useAuth();
  
  // Use real data from Firebase
  const { quizzes, loading: quizzesLoading, error: quizzesError, refresh: refreshQuizzes } = useQuizzes();
  const { categories, loading: categoriesLoading } = useQuizCategories();
  const { progress, loading: progressLoading, refresh: refreshProgress } = useUserScore(user?.uid || '');
  const { progressMap, loading: progressMapLoading, refresh: refreshQuizProgress } = useUserQuizProgress(user?.uid || '');

  // Auto refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshQuizzes();
      refreshProgress();
      refreshQuizProgress();
    }, [refreshQuizzes, refreshProgress, refreshQuizProgress])
  );

  const handleBackPress = () => {
    router.back();
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

  const handleQuizStart = (quizId: string) => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Đăng nhập để tham gia thử thách.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng nhập', onPress: () => router.push({
              pathname: '/login',
              params: { from: 'quiz' }
            })
          }
        ]
      );
      return;
    }

    router.push({
      pathname: '/do-quiz/[id]',
      params: { id: quizId }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Hide search input and clear search query when refreshing
    if (showSearchInput) {
      setShowSearchInput(false);
      setSearchQuery('');
    }

    try {
      await Promise.all([
        refreshQuizzes(),
        refreshProgress(),
        refreshQuizProgress()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCompletionStatus = (quizId: string) => {
    // Check if user has a score record for this quiz
    // For now we use the progress map we just implemented
    return progressMap[quizId] || false;
  };

  const getPerfectedStatus = (quizId: string) => {
    return progress?.perfectedQuizIds?.includes(quizId) || false;
  };

  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesCategory = selectedCategory === 'all' || quiz.categoryId === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        normalizeText(quiz.title).includes(normalizeText(searchQuery)) ||
        normalizeText(quiz.description || '').includes(normalizeText(searchQuery));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      // Sort by title alphabetically (A-Z)
      const titleA = normalizeText(a.title);
      const titleB = normalizeText(b.title);
      return titleA.localeCompare(titleB, 'vi', { sensitivity: 'base' });
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#757575';
    }
  };

  if (authLoading || (quizzesLoading && !refreshing)) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Thử thách</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Kiểm tra hiểu biết về văn hóa Khmer</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <ThemedText style={styles.loadingText}>Đang tải quiz...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (quizzesError) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Thử thách</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Kiểm tra hiểu biết về văn hóa Khmer</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Không thể tải dữ liệu quiz. Vui lòng thử lại.
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refreshQuizzes}>
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Thử thách</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Kiểm tra hiểu biết về văn hóa Khmer</ThemedText>
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
              Tìm thấy {filteredQuizzes.length} kết quả cho "{searchQuery}" (A-Z)
            </ThemedText>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Tiến độ học tập</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[
              styles.progressBar,
              { width: progress.totalQuizzes > 0 ? `${(progress.completedQuizzes / progress.totalQuizzes) * 100}%` : '0%' }
            ]} />
          </View>
          <View style={styles.progressStats}>
            <ThemedText style={styles.progressStatsText}>
              Đã hoàn thành: {progress.completedQuizzes} quiz
            </ThemedText>
            <ThemedText style={styles.progressStatsText}>
              Tổng điểm: {progress.totalScore}
            </ThemedText>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ThemedText style={styles.sectionTitle}>Chủ đề</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === 'all' && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <ThemedText style={[
                styles.categoryTabText,
                selectedCategory === 'all' && styles.categoryTabTextActive
              ]}>
                Tất cả
              </ThemedText>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(category.id!)}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.categoryTabTextActive
                ]}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <View style={styles.quizList}>
          {filteredQuizzes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {searchQuery.trim() ?
                  `Không tìm thấy quiz nào với từ khóa "${searchQuery}"` :
                  selectedCategory === 'all'
                    ? 'Chưa có quiz nào'
                    : 'Chưa có quiz cho chủ đề này'
                }
              </ThemedText>
            </View>
          ) : (
            filteredQuizzes.map((quiz) => {
              const isCompleted = getCompletionStatus(quiz.id!);
              const isPerfected = getPerfectedStatus(quiz.id!);
              
              return (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.quizCard}
                  onPress={() => handleQuizStart(quiz.id!)}
                  activeOpacity={0.8}
                >
                  <View style={styles.quizCardHeader}>
                    <Image
                      source={quiz.imageUrl ? { uri: quiz.imageUrl } : require('@/assets/images/chua1.jpg')}
                      style={styles.quizCardImage}
                    />
                    <View style={styles.quizCardBadge}>
                      <ThemedText style={styles.quizCardBadgeText}>
                        {quiz.totalQuestions} câu hỏi
                      </ThemedText>
                    </View>
                    <View style={[
                      styles.quizCardDifficulty,
                      { backgroundColor: getDifficultyColor(quiz.difficulty) }
                    ]}>
                      <ThemedText style={styles.quizCardDifficultyText}>
                        {quiz.difficultyText}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.quizCardContent}>
                    <ThemedText style={styles.quizCardTitle}>{quiz.title}</ThemedText>
                    <ThemedText style={styles.quizCardDescription}>
                      {quiz.description}
                    </ThemedText>

                    <View style={styles.quizCardFooter}>
                      <View style={styles.quizCardInfo}>
                        <View style={styles.quizInfoItem}>
                          <Ionicons name="time-outline" size={14} color="#ff6b57" />
                          <ThemedText style={styles.quizInfoText}>{quiz.duration} phút</ThemedText>
                        </View>
                        <View style={styles.quizInfoItem}>
                          <Ionicons name="trophy-outline" size={14} color="#ff6b57" />
                          <ThemedText style={styles.quizInfoText}>{quiz.maxPoints} điểm</ThemedText>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.quizCardButton,
                          isCompleted && styles.quizCardButtonCompleted,
                          isPerfected && styles.quizCardButtonPerfected
                        ]}
                        onPress={() => handleQuizStart(quiz.id!)}
                      >
                        <ThemedText style={styles.quizCardButtonText}>
                          {isPerfected ? 'Hoàn thành' : (isCompleted ? 'Làm lại' : 'Bắt đầu')}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    padding: 20,
    paddingBottom: 100,
  },
  progressSection: {
    backgroundColor: '#ff6b57',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  progressScore: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: 'white',
    height: '100%',
    borderRadius: 10,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2d2d2d',
  },
  categoryTabs: {
    marginBottom: 20,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryTabActive: {
    backgroundColor: '#ff6b57',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  categoryTabTextActive: {
    color: 'white',
  },
  quizList: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  quizCardHeader: {
    position: 'relative',
    height: 120,
  },
  quizCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quizCardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  quizCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff6b57',
  },
  quizCardDifficulty: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizCardDifficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  quizCardContent: {
    padding: 15,
  },
  quizCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2d2d2d',
  },
  quizCardDescription: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 12,
    lineHeight: 18,
  },
  quizCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizCardInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  quizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quizInfoText: {
    fontSize: 12,
    color: '#757575',
  },
  quizCardButton: {
    backgroundColor: '#2282ff', // Màu xanh nước biển
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quizCardButtonCompleted: {
    backgroundColor: '#1a73e8', // Xanh nước biển đậm hơn cho 'Làm lại'
  },
  quizCardButtonPerfected: {
    backgroundColor: '#f44336', // Màu đỏ cho 'Hoàn thành'
  },
  quizCardButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300, // Giảm từ default xuống 300
    paddingVertical: 60, // Giảm từ mặc định xuống 60
    marginVertical: 20, // Giảm margin dọc
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22, // Giảm line height
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff6b57',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
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
});