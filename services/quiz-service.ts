import { db } from '@/config/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

// Types
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  explanation: string;
  imageUrl?: string;
}

export interface Quiz {
  id?: string;
  categoryId: string; // Links to quizCategories
  category?: string;   // For display/backward compatibility
  title: string;
  description: string;
  imageUrl: string;
  totalQuestions: number;
  duration: number; // minutes
  maxPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  questions?: QuizQuestion[]; // Optional as they might be fetched separately from sub-collection
}

export interface QuizAttempt {
  id?: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  completedAt: Date;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

export interface UserScore {
  id?: string;
  userId: string;
  username: string;
  photoURL?: string;
  totalScore: number;
  completedQuizzes: number;
  completedQuizIds?: string[]; // Danh sách ID các bài đã hoàn thành
  perfectedQuizIds?: string[]; // Danh sách ID các bài đã đạt điểm tối đa (100%)
  averageScore: number;
  rank: number;
  achievements: string[];
  lastActive: Date;
  // History is now a sub-collection for better scalability
}

export interface QuizCategory {
  id?: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  displayOrder?: number;
}

export interface QuizProgress {
  userId: string;
  quizId: string;
  answers: { [questionId: string]: number };
  lastIndex: number;
  timeSpent: number; // Tổng số giây đã làm bài
  updatedAt: any;
}

// Collections
const COLLECTIONS = {
  quizzes: 'quizzes',
  userScores: 'userScores',
  quizCategories: 'quizCategories',
  quizProgress: 'quizProgress'
};

// Get all quizzes
export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.quizzes),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const quizzes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date()
      } as Quiz;
    });
    
    return quizzes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting quizzes:', error);
    return getFallbackQuizzes();
  }
};

/**
 * Get quiz questions from sub-collection
 */
export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  try {
    const questionsSnapshot = await getDocs(
      collection(db, COLLECTIONS.quizzes, quizId, 'questions')
    );
    
    const mapQuestion = (q: any): QuizQuestion => ({
      id: q.id,
      questionText: q.questionText || q.question || '',
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : (q.correctAnswer !== undefined ? q.correctAnswer : 0),
      points: q.points || 0,
      explanation: q.explanation || '',
      imageUrl: q.imageUrl
    });

    if (questionsSnapshot.empty) {
      // If sub-collection is empty, check if questions are in the main document (backward compatibility)
      const allQuizzes = await getQuizzes();
      const quizDoc = allQuizzes.find(q => q.id === quizId);
      return (quizDoc?.questions || []).map(mapQuestion);
    }

    return questionsSnapshot.docs.map(doc => mapQuestion({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting questions for quiz ${quizId}:`, error);
    return [];
  }
};

// Fallback quiz data
const getFallbackQuizzes = (): Quiz[] => {
  const now = new Date();
  return [
    {
      id: 'fallback-quiz-1',
      categoryId: 'pagoda',
      category: 'pagoda',
      title: 'Kiến thức về Chùa Khmer',
      description: 'Khám phá kiến trúc và lịch sử các ngôi chùa Khmer nổi tiếng',
      imageUrl: 'https://dulichvietnam.com.vn/vnt_upload/news/03_2020/chua-ang-tra-vinh-3.jpg',
      totalQuestions: 3,
      duration: 5,
      maxPoints: 30,
      difficulty: 'easy',
      difficultyText: 'Dễ',
      isActive: true,
      createdAt: now,
      questions: [
        {
          id: 'q1',
          questionText: 'Ngôi chùa nào được mệnh danh là "viên ngọc" của kiến trúc Khmer tại Trà Vinh?',
          options: ['Chùa Hang', 'Chùa Ang', 'Chùa Vam Ray', 'Chùa Som Rong'],
          correctOptionIndex: 1,
          points: 10,
          explanation: 'Chùa Ang (Angkorajaborey) là một trong những ngôi chùa cổ nhất và đẹp nhất tại Trà Vinh.'
        },
        {
          id: 'q2',
          questionText: 'Mái chùa Khmer thường có hình tượng con vật nào ở các góc đạo?',
          options: ['Rồng (Naga)', 'Phượng hoàng', 'Sư tử', 'Voi'],
          correctOptionIndex: 0,
          points: 10,
          explanation: 'Hình tượng rồng Naga 5 đầu hoặc 7 đầu thường xuất hiện ở các góc mái chùa để bảo vệ đức Phật.'
        },
        {
          id: 'q3',
          questionText: 'Cổng chùa Khmer thường quay về hướng nào?',
          options: ['Hướng Nam', 'Hướng Bắc', 'Hướng Đông', 'Hướng Tây'],
          correctOptionIndex: 2,
          points: 10,
          explanation: 'Hầu hết các chùa Khmer đều quay mặt về hướng Đông, hướng của sự sinh sôi và khởi đầu.'
        }
      ]
    },
    {
      id: 'fallback-quiz-2',
      categoryId: 'culture',
      category: 'culture',
      title: 'Lễ hội truyền thống Khmer',
      description: 'Tìm hiểu về các lễ hội và phong tục tập quán của người Khmer',
      imageUrl: 'https://dulichvietnam.com.vn/vnt_upload/news/04_2020/le-hoi-khmer.jpg',
      totalQuestions: 2,
      duration: 8,
      maxPoints: 20,
      difficulty: 'medium',
      difficultyText: 'Trung bình',
      isActive: true,
      createdAt: now,
      questions: [
        {
          id: 'q4',
          questionText: 'Lễ hội mừng năm mới của người Khmer có tên gọi là gì?',
          options: ['Ok Om Bok', 'Sen Dolta', 'Chol Chnam Thmay', 'Kathina'],
          correctOptionIndex: 2,
          points: 10,
          explanation: 'Chol Chnam Thmay là lễ hội mừng năm mới truyền thống của người Khmer.'
        },
        {
          id: 'q5',
          questionText: 'Lễ hội nào có hoạt động đua ghe Ngo truyền thống?',
          options: ['Ok Om Bok', 'Sen Dolta', 'Lễ Kathina', 'Lễ tắm Phật'],
          correctOptionIndex: 0,
          points: 10,
          explanation: 'Đua ghe Ngo là hoạt động sôi nổi nhất trong lễ hội Ok Om Bok (Lễ cúng Trăng).'
        }
      ]
    }
  ];
};

// Get quizzes by category
export const getQuizzesByCategory = async (category: string): Promise<Quiz[]> => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTIONS.quizzes),
      where('category', '==', category),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const quizzes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Quiz));
    
    // Sort in memory instead of using orderBy
    return quizzes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting quizzes by category:', error);
    throw error;
  }
};

// Get quiz categories
export const getQuizCategories = async (): Promise<QuizCategory[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.quizCategories));
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QuizCategory[];
    
    // Sắp xếp theo displayOrder
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error getting quiz categories:', error);
    // Return fallback categories
    return [
      { id: 'pagoda', name: 'Chùa Khmer', icon: '🏛️', color: '#ff6b57' },
      { id: 'culture', name: 'Văn hóa', icon: '🎭', color: '#9c27b0' },
      { id: 'cuisine', name: 'Ẩm thực', icon: '🍜', color: '#ff9800' },
      { id: 'language', name: 'Ngôn ngữ', icon: '📝', color: '#2196f3' }
    ];
  }
};

// Get user score
export const getUserScore = async (userId: string): Promise<UserScore | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.userScores),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastActive: data.lastActive?.toDate() || new Date(),
    } as UserScore;
  } catch (error) {
    console.error('Error getting user score:', error);
    throw error;
  }
};

/**
 * Get user quiz attempts history from sub-collection
 */
export const getUserAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const scoreDoc = await getUserScore(userId);
    if (!scoreDoc?.id) return [];

    const attemptsSnapshot = await getDocs(
      collection(db, COLLECTIONS.userScores, scoreDoc.id, 'attempts')
    );

    return attemptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate() || new Date()
    } as QuizAttempt)).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  } catch (error) {
    console.error(`Error getting attempts for user ${userId}:`, error);
    return [];
  }
};

// Get top users (leaderboard)
export const getLeaderboard = async (limit: number = 10): Promise<UserScore[]> => {
  try {
    // Get all user scores without orderBy to avoid index requirement
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.userScores));
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastActive: data.lastActive?.toDate() || new Date()
      } as UserScore;
    });
    
    // Sort by totalScore in memory and assign ranks
    const sortedUsers = users
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    
    return sortedUsers;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Submit quiz result
export const submitQuizResult = async (
  userId: string,
  username: string,
  quizAttempt: Omit<QuizAttempt, 'id' | 'completedAt'>
): Promise<void> => {
  try {
    // 1. Get or create user score document
    let userScore = await getUserScore(userId);
    let userScoreId = userScore?.id;
    
    const completionDate = new Date();
    const newAttempt: QuizAttempt = {
      ...quizAttempt,
      completedAt: completionDate
    };

    // Check if this is the first time completing this specific quiz
    if (userScore) {
      // Update existing user score: cumulative total
      // Calculate new score and count: ONLY add if it's a new unique quiz
      let currentTotalScore = userScore.totalScore || 0;
      let currentCompletedCount = userScore.completedQuizzes || 0;
      let completedIds = userScore.completedQuizIds || [];
      let perfectedIds = userScore.perfectedQuizIds || [];
      
      const alreadyCompleted = completedIds.includes(quizAttempt.quizId);
      const isPerfect = quizAttempt.score === quizAttempt.maxScore;
      
      let updatedScore = currentTotalScore;
      let updatedCount = currentCompletedCount;
      
      if (!alreadyCompleted) {
        updatedScore += quizAttempt.score;
        updatedCount += 1;
        completedIds.push(quizAttempt.quizId);
      }
      
      if (isPerfect && !perfectedIds.includes(quizAttempt.quizId)) {
        perfectedIds.push(quizAttempt.quizId);
      }
      
      const docRef = doc(db, COLLECTIONS.userScores, userScoreId!);
      await updateDoc(docRef, {
        totalScore: updatedScore,
        completedQuizzes: updatedCount,
        completedQuizIds: completedIds,
        perfectedQuizIds: perfectedIds,
        averageScore: updatedCount > 0 ? updatedScore / updatedCount : 0,
        lastActive: completionDate,
        username: username
      });
    } else {
      // Create new user score
      const userScoreId = userId; 
      const isPerfect = quizAttempt.score === quizAttempt.maxScore;
      await setDoc(doc(db, COLLECTIONS.userScores, userScoreId), {
        userId,
        username,
        totalScore: quizAttempt.score,
        completedQuizzes: 1,
        completedQuizIds: [quizAttempt.quizId],
        perfectedQuizIds: isPerfect ? [quizAttempt.quizId] : [],
        averageScore: quizAttempt.score,
        lastActive: completionDate,
        rank: 0,
        achievements: []
      });
    }

    // 2. Add detailed attempt history to sub-collection
    if (userScoreId) {
      await addDoc(
        collection(db, COLLECTIONS.userScores, userScoreId, 'attempts'),
        newAttempt
      );
    }

    // Update rankings (simplified - in production, use Cloud Functions)
    await updateRankings();
    
    // 4. Clear temporary progress after successful submission
    const progressId = `${userId}_${quizAttempt.quizId}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.quizProgress, progressId));
    } catch (e) {
      // Ignore if progress doesn't exist
    }
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    throw error;
  }
};

// Update user rankings
const updateRankings = async (): Promise<void> => {
  try {
    const leaderboard = await getLeaderboard(100); // Get top 100
    
    // Update ranks
    for (let i = 0; i < leaderboard.length; i++) {
      const user = leaderboard[i];
      if (user.id && user.rank !== i + 1) {
        const docRef = doc(db, COLLECTIONS.userScores, user.id);
        await updateDoc(docRef, { rank: i + 1 });
      }
    }
  } catch (error) {
    console.error('Error updating rankings:', error);
  }
};

// Get user progress
export const getUserProgress = async (userId: string): Promise<{
  completedQuizzes: number;
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  rank: number;
  perfectedQuizIds: string[];
}> => {
  try {
    const [userScore, allQuizzes] = await Promise.all([
      getUserScore(userId),
      getQuizzes()
    ]);

    return {
      completedQuizzes: userScore?.completedQuizzes || 0,
      totalQuizzes: allQuizzes.length,
      totalScore: userScore?.totalScore || 0,
      averageScore: userScore?.averageScore || 0,
      rank: userScore?.rank || 0,
      perfectedQuizIds: userScore?.perfectedQuizIds || []
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    // Return fallback progress
    return {
      completedQuizzes: 0,
      totalQuizzes: 0,
      totalScore: 0,
      averageScore: 0,
      rank: 0,
      perfectedQuizIds: []
    };
  }
};

/**
 * Save temporary quiz progress
 */
export const saveQuizProgress = async (progress: QuizProgress): Promise<void> => {
  try {
    const progressId = `${progress.userId}_${progress.quizId}`;
    await setDoc(doc(db, COLLECTIONS.quizProgress, progressId), {
      ...progress,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving quiz progress:', error);
  }
};

/**
 * Get all quiz progress for a user to determine "Start" vs "Retry" status
 */
export const getAllUserProgress = async (userId: string): Promise<{ [quizId: string]: boolean }> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.quizProgress),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const progressMap: { [quizId: string]: boolean } = {};
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      // If they have answered at least one question
      if (data.answers && Object.keys(data.answers).length > 0) {
        progressMap[data.quizId] = true;
      }
    });
    
    return progressMap;
  } catch (error) {
    console.error('Error getting all user progress:', error);
    return {};
  }
};

/**
 * Get progress for a specific quiz to allow resuming
 */
export const getQuizProgress = async (userId: string, quizId: string): Promise<QuizProgress | null> => {
  try {
    const progressId = `${userId}_${quizId}`;
    const docRef = doc(db, COLLECTIONS.quizProgress, progressId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as QuizProgress;
    }
    return null;
  } catch (error) {
    console.error('Error getting quiz progress:', error);
    return null;
  }
};