import {
    getLeaderboard,
    getQuizCategories,
    getQuizQuestions,
    getQuizzes,
    getQuizzesByCategory,
    getUserAttempts,
    getUserProgress,
    getUserScore,
    Quiz,
    QuizAttempt,
    QuizCategory,
    QuizQuestion,
    submitQuizResult,
    UserScore,
    getAllUserProgress
} from '@/services/quiz-service';
import { useCallback, useEffect, useState } from 'react';

// Hook to get user quiz progress
export function useUserQuizProgress(userId: string) {
  const [progressMap, setProgressMap] = useState<{ [quizId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgressMap({});
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await getAllUserProgress(userId);
      setProgressMap(data);
    } catch (error) {
      console.error('Error in useUserQuizProgress:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progressMap, loading, refresh: fetchProgress };
}

// Hook to get all quizzes
export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      console.error('Error in useQuizzes:', err);
      setError(err as Error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const refresh = useCallback(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  return { quizzes, loading, error, refresh };
}

// Hook to get quiz questions from sub-collection
export function useQuizQuestions(quizId: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuizQuestions(quizId);
      setQuestions(data);
      setError(null);
    } catch (err) {
      console.error(`Error in useQuizQuestions for ${quizId}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      loadQuestions();
    }
  }, [quizId, loadQuestions]);

  const refresh = useCallback(() => {
    loadQuestions();
  }, [loadQuestions]);

  return { questions, loading, error, refresh };
}

// Hook to get quizzes by category
export function useQuizzesByCategory(category: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (category && category !== 'all') {
      loadQuizzesByCategory();
    }
  }, [category]);

  const loadQuizzesByCategory = async () => {
    try {
      setLoading(true);
      const data = await getQuizzesByCategory(category);
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadQuizzesByCategory();
  };

  return { quizzes, loading, error, refresh };
}

// Hook to get quiz categories
export function useQuizCategories() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuizCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error in useQuizCategories:', err);
      setError(err as Error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, error, refresh };
}

// Hook to get user score and progress
export function useUserScore(userId?: string) {
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [progress, setProgress] = useState({
    completedQuizzes: 0,
    totalQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    rank: 0,
    perfectedQuizIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    } else {
      setUserScore(null);
      setProgress({
        completedQuizzes: 0,
        totalQuizzes: 0,
        totalScore: 0,
        averageScore: 0,
        rank: 0,
        perfectedQuizIds: []
      });
      setLoading(false);
    }
  }, [userId]);

  const loadUserData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [scoreData, progressData] = await Promise.all([
        getUserScore(userId),
        getUserProgress(userId)
      ]);
      
      setUserScore(scoreData);
      setProgress(progressData);
      setError(null);
    } catch (err) {
      console.error('Error in useUserScore:', err);
      setError(err as Error);
      // Set fallback data
      setUserScore(null);
      setProgress({
        completedQuizzes: 0,
        totalQuizzes: 0,
        totalScore: 0,
        averageScore: 0,
        rank: 0,
        perfectedQuizIds: []
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitResult = async (
    username: string,
    quizResult: Parameters<typeof submitQuizResult>[2]
  ) => {
    if (!userId) {
      throw new Error('User must be logged in to submit quiz results');
    }
    
    try {
      await submitQuizResult(userId, username, quizResult);
      // Reload user data after submitting
      await loadUserData();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refresh = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  return { userScore, progress, loading, error, submitResult, refresh };
}

// Hook to get user quiz attempts history
export function useUserAttempts(userId?: string) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAttempts = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getUserAttempts(userId);
      setAttempts(data);
      setError(null);
    } catch (err) {
      console.error(`Error in useUserAttempts for ${userId}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadAttempts();
    }
  }, [userId, loadAttempts]);

  const refresh = useCallback(() => {
    loadAttempts();
  }, [loadAttempts]);

  return { attempts, loading, error, refresh };
}

// Hook to get leaderboard
export function useLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(limit);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadLeaderboard();
  };

  return { leaderboard, loading, error, refresh };
}