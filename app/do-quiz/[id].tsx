import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizQuestions, useQuizzes, useUserScore } from '@/hooks/use-quiz';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getQuizProgress, saveQuizProgress } from '@/services/quiz-service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function DoQuizScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  const { user } = useAuth();

  // Quiz data
  const { quizzes } = useQuizzes();
  const { questions, loading: questionsLoading } = useQuizQuestions(id as string);
  const { submitResult } = useUserScore(user?.uid || '');

  const currentQuiz = quizzes.find(q => q.id === id);

  // Gameplay State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step 1: Explicitly reset state when ID changes to prevent data leakage
  useEffect(() => {
    if (id) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowResult(false);
      setAccumulatedTime(0);
      // Reset progress bar to 0 immediately
      progressAnim.setValue(0);
    }
  }, [id, progressAnim]);

  // Step 2: Progress Restoration
  const restoreProgress = useCallback(async () => {
    if (user && id && questions.length > 0) {
      const savedProgress = await getQuizProgress(user.uid, id as string);
      if (savedProgress && savedProgress.answers) {
        setSelectedAnswers(savedProgress.answers);
        if (savedProgress.timeSpent) {
          setAccumulatedTime(savedProgress.timeSpent);
        }
        if (savedProgress.lastIndex !== undefined && savedProgress.lastIndex < questions.length) {
          setCurrentIndex(savedProgress.lastIndex);
        }
      }
    }
  }, [id, user, questions.length]);

  // Debugging & Initial Load
  useEffect(() => {
    restoreProgress();
    console.log(`Quiz ID: ${id}, Questions loaded: ${questions.length}`);
  }, [id, user, questions.length, restoreProgress]);

  // Update progress bar when index changes
  useEffect(() => {
    if (questions.length > 0) {
      const progress = currentIndex / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, questions.length]);

  const handleOptionSelect = (optionIndex: number) => {
    const questionId = questions[currentIndex].id;
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: optionIndex
    };

    setSelectedAnswers(newAnswers);

    // Save progress to Firestore
    if (user) {
      const currentTimeSpent = Math.floor(accumulatedTime + (Date.now() - startTime) / 1000);
      saveQuizProgress({
        userId: user.uid,
        quizId: id as string,
        answers: newAnswers,
        lastIndex: currentIndex,
        timeSpent: currentTimeSpent,
        updatedAt: new Date()
      });
    }
  };

  const handleNext = () => {
    if (questions.length === 0) return;

    if (currentIndex < questions.length - 1) {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prev => prev + 1);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else if (currentIndex === questions.length - 1 && questions.length > 0) {
      // Only calculate if we are truly at the last question
      calculateResult();
    }
  };

  const handleRetry = async () => {
    // 1. Reset local state
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setShowResult(false);
    setIsSubmitting(false);
    progressAnim.setValue(0);

    // 2. Reset progress in Firestore
    if (user && id) {
      try {
        await saveQuizProgress({
          userId: user.uid,
          quizId: id as string,
          answers: {},
          lastIndex: 0,
          timeSpent: 0,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error resetting progress:', error);
      }
    }
  };

  const calculateResult = () => {
    let finalScore = 0;
    let correctCount = 0;

    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        finalScore += q.points;
        correctCount += 1;
      }
    });

    setScore(finalScore);
    setShowResult(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor(accumulatedTime + (Date.now() - startTime) / 1000);
      const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctOptionIndex).length;

      await submitResult(user?.displayName || 'Người dùng KhmerGo', {
        quizId: id as string,
        quizTitle: currentQuiz?.title || 'Unknown Quiz',
        score: score,
        maxScore: currentQuiz?.maxPoints || 0,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeSpent: timeSpent,
        answers: questions.map(q => ({
          questionId: q.id,
          selectedOption: selectedAnswers[q.id],
          isCorrect: selectedAnswers[q.id] === q.correctOptionIndex
        }))
      });

      // Điều hướng sau khi nộp bài
      if (params.source === 'pagoda-detail' && params.templeId) {
        router.navigate({
          pathname: '/pagoda-detail',
          params: { id: params.templeId as string }
        });
      } else {
        router.replace('/quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questionsLoading || !currentQuiz) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b57" />
        <ThemedText style={styles.loadingText}>Đang chuẩn bị câu hỏi...</ThemedText>
      </ThemedView>
    );
  }

  if (questions.length === 0) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <ThemedText style={styles.errorText}>Không tìm thấy câu hỏi cho bộ Quiz này.</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (showResult) {
    const isPass = score >= (currentQuiz.maxPoints * 0.5);
    return (
      <ThemedView style={styles.resultContainer}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={[styles.resultCard, { borderTopColor: isPass ? '#4caf50' : '#ff6b57' }]}>
            <Ionicons
              name={isPass ? "trophy" : "ribbon"}
              size={80}
              color={isPass ? "#4caf50" : "#ff6b57"}
            />
            <ThemedText
              style={styles.resultTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {isPass ? 'Tuyệt vời vá' : 'Cố gắng hơn nhé'}
            </ThemedText>
            <ThemedText style={styles.resultScoreText}>Bạn đạt được {score} điểm</ThemedText>

            <View style={styles.resultStats}>
              <View style={styles.resultStatItem}>
                <ThemedText style={styles.statLabel}>Đúng</ThemedText>
                <ThemedText style={styles.statValue}>
                  {questions.filter(q => selectedAnswers[q.id] === q.correctOptionIndex).length}/{questions.length}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Nộp bài</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <ThemedText style={styles.retryButtonText}>Làm lại</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (params.source === 'pagoda-detail' && params.templeId) {
              router.navigate({
                pathname: '/pagoda-detail',
                params: { id: params.templeId as string }
              });
            } else {
              router.back();
            }
          }} 
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabel}>
            <ThemedText style={styles.progressText}>Câu hỏi {currentIndex + 1}/{questions.length}</ThemedText>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText style={styles.questionText}>{currentQuestion.questionText}</ThemedText>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: '#ff6b57', backgroundColor: '#fff5f4' }
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionCircle,
                    isSelected && { backgroundColor: '#ff6b57' }
                  ]}>
                    <ThemedText style={[
                      styles.optionLetter,
                      isSelected && { color: 'white' }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[
                    styles.optionText,
                    isSelected && { fontWeight: '600' }
                  ]}>
                    {option}
                  </ThemedText>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#ff6b57" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Area */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswers[currentQuestion.id] === undefined && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedAnswers[currentQuestion.id] === undefined}
        >
          <ThemedText style={[styles.nextButtonText, { flexShrink: 0 }]}>
            {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
          </ThemedText>
          <Ionicons
            name={currentIndex === questions.length - 1 ? "checkmark-done" : "arrow-forward"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#ff6b57',
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 65, // Increased to avoid notch
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 10,
    marginLeft: -10,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 10,
  },
  progressLabel: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff6b57',
    borderRadius: 3,
  },
  questionArea: {
    flex: 1,
  },
  questionContent: {
    padding: 20,
    paddingTop: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d2d2d',
    lineHeight: 28,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    color: '#444',
    lineHeight: 22,
  },
  checkIcon: {
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b57',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false, // Ngăn việc cắt chữ trên Android
    textAlignVertical: 'center',
    lineHeight: 24, // Đảm bảo đủ chiều cao cho dấu tiếng Việt
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  resultScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30, // Reduced from 40
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 15,
    color: '#2d2d2d',
    textAlign: 'center',
    width: '100%',
    lineHeight: 34, // Đảm bảo đủ chiều cao cho dấu tiếng Việt
    paddingVertical: 2, // Thêm đệm nhỏ để tránh cắt dấu
  },
  resultScoreText: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  resultStatItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  submitButton: {
    backgroundColor: '#ff6b57',
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 24,
  },
  retryButton: {
    padding: 12,
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 22,
  },
});
