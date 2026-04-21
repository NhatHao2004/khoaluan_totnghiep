import {
    getLeaderboard,
    getQuizCategories,
    getQuizzes,
    getQuizzesByCategory,
    getUserProgress,
    getUserScore,
    Quiz,
    QuizCategory,
    submitQuizResult,
    UserScore
} from '@/services/quiz-service';
import { useCallback, useEffect, useState } from 'react';

// Hook to get all quizzes
export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      console.error('Error in useQuizzes:', err);
      setError(err as Error);
      // Set empty array as fallback
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadQuizzes();
  };

  return { quizzes, loading, error, refresh };
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getQuizCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error in useQuizCategories:', err);
      setError(err as Error);
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadCategories();
  };

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
    rank: 0
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
        rank: 0
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
        totalQuizzes: 3,
        totalScore: 0,
        averageScore: 0,
        rank: 0
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