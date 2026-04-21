import { db } from '@/config/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';

// Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
}

export interface Quiz {
  id?: string;
  category: string;
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
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
  timeSpent: number; // minutes
  correctAnswers: number;
  totalQuestions: number;
}

export interface UserScore {
  id?: string;
  userId: string;
  username: string;
  totalScore: number;
  completedQuizzes: number;
  averageScore: number;
  rank: number;
  achievements: string[];
  lastActive: Date;
  quizResults: QuizResult[];
}

export interface QuizCategory {
  id?: string;
  name: string;
  icon: string;
  color: string;
}

// Collections
const COLLECTIONS = {
  quizzes: 'quizzes',
  userScores: 'userScores',
  quizCategories: 'quizCategories'
};

// Get all quizzes
export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTIONS.quizzes),
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
    console.error('Error getting quizzes:', error);
    // Return fallback data if Firebase fails
    return getFallbackQuizzes();
  }
};

// Fallback quiz data
const getFallbackQuizzes = (): Quiz[] => {
  return [
    {
      id: 'fallback-quiz-1',
      category: 'pagoda',
      title: 'Kiến thức về Chùa Khmer',
      description: 'Khám phá kiến trúc và lịch sử các ngôi chùa Khmer nổi tiếng',
      imageUrl: 'https://dulichvietnam.com.vn/vnt_upload/news/03_2020/chua-ang-tra-vinh-3.jpg',
      totalQuestions: 10,
      duration: 5,
      maxPoints: 50,
      difficulty: 'easy',
      difficultyText: 'Dễ',
      isActive: true,
      createdAt: new Date(),
      questions: []
    },
    {
      id: 'fallback-quiz-2',
      category: 'culture',
      title: 'Lễ hội truyền thống Khmer',
      description: 'Tìm hiểu về các lễ hội và phong tục tập quán của người Khmer',
      imageUrl: 'https://dulichvietnam.com.vn/vnt_upload/news/04_2020/le-hoi-khmer.jpg',
      totalQuestions: 15,
      duration: 8,
      maxPoints: 75,
      difficulty: 'medium',
      difficultyText: 'Trung bình',
      isActive: true,
      createdAt: new Date(),
      questions: []
    },
    {
      id: 'fallback-quiz-3',
      category: 'cuisine',
      title: 'Ẩm thực Khmer truyền thống',
      description: 'Khám phá các món ăn đặc trưng của người Khmer Nam Bộ',
      imageUrl: 'https://dulichvietnam.com.vn/vnt_upload/news/05_2020/am-thuc-khmer.jpg',
      totalQuestions: 12,
      duration: 6,
      maxPoints: 60,
      difficulty: 'easy',
      difficultyText: 'Dễ',
      isActive: true,
      createdAt: new Date(),
      questions: []
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as QuizCategory));
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
    return {
      id: doc.id,
      ...doc.data(),
      lastActive: doc.data().lastActive?.toDate() || new Date(),
      quizResults: doc.data().quizResults?.map((result: any) => ({
        ...result,
        completedAt: result.completedAt?.toDate() || new Date()
      })) || []
    } as UserScore;
  } catch (error) {
    console.error('Error getting user score:', error);
    throw error;
  }
};

// Get top users (leaderboard)
export const getLeaderboard = async (limit: number = 10): Promise<UserScore[]> => {
  try {
    // Get all user scores without orderBy to avoid index requirement
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.userScores));
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastActive: doc.data().lastActive?.toDate() || new Date(),
      quizResults: doc.data().quizResults?.map((result: any) => ({
        ...result,
        completedAt: result.completedAt?.toDate() || new Date()
      })) || []
    } as UserScore));
    
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
  quizResult: Omit<QuizResult, 'completedAt'> & { completedAt?: Date }
): Promise<void> => {
  try {
    // Get existing user score
    let userScore = await getUserScore(userId);
    
    const newQuizResult: QuizResult = {
      ...quizResult,
      completedAt: new Date()
    };

    if (userScore) {
      // Update existing user score
      const existingResultIndex = userScore.quizResults.findIndex(
        result => result.quizId === quizResult.quizId
      );

      if (existingResultIndex >= 0) {
        // Update existing quiz result
        userScore.quizResults[existingResultIndex] = newQuizResult;
      } else {
        // Add new quiz result
        userScore.quizResults.push(newQuizResult);
        userScore.completedQuizzes += 1;
      }

      // Recalculate totals
      userScore.totalScore = userScore.quizResults.reduce((sum, result) => sum + result.score, 0);
      userScore.averageScore = userScore.totalScore / userScore.quizResults.length;
      userScore.lastActive = new Date();

      // Update in Firebase
      const docRef = doc(db, COLLECTIONS.userScores, userScore.id!);
      await updateDoc(docRef, {
        totalScore: userScore.totalScore,
        completedQuizzes: userScore.completedQuizzes,
        averageScore: userScore.averageScore,
        lastActive: userScore.lastActive,
        quizResults: userScore.quizResults
      });
    } else {
      // Create new user score
      const newUserScore: Omit<UserScore, 'id'> = {
        userId,
        username,
        totalScore: newQuizResult.score,
        completedQuizzes: 1,
        averageScore: newQuizResult.score,
        rank: 0, // Will be calculated later
        achievements: [],
        lastActive: new Date(),
        quizResults: [newQuizResult]
      };

      await addDoc(collection(db, COLLECTIONS.userScores), newUserScore);
    }

    // Update rankings (simplified - in production, use Cloud Functions)
    await updateRankings();
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
      rank: userScore?.rank || 0
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    // Return fallback progress
    return {
      completedQuizzes: 0,
      totalQuizzes: 3,
      totalScore: 0,
      averageScore: 0,
      rank: 0
    };
  }
};