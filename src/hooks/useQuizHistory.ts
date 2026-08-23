import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface QuizHistoryRecord {
  id: string;
  userId: string;
  quizType: string;
  quizContext?: string;
  totalExpected: number; // Number of correct answers
  totalSelected: number; // Total questions answered
  completedAt: string;
}

const STORAGE_PREFIX = 'lexora_quiz_history_';

export function useQuizHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return `${STORAGE_PREFIX}${user?.id || 'guest'}`;
  }, [user?.id]);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to load quiz history from localStorage:', e);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveQuizAttempt = async (attempt: {
    quizType: string;
    quizContext?: string;
    totalExpected: number;
    totalSelected: number;
  }) => {
    const newRecord: QuizHistoryRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'guest',
      quizType: attempt.quizType,
      quizContext: attempt.quizContext,
      totalExpected: attempt.totalExpected,
      totalSelected: attempt.totalSelected,
      completedAt: new Date().toISOString(),
    };

    // Update local state and localStorage
    setHistory((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save quiz history to localStorage:', e);
      }
      return updated;
    });

    // Optionally attempt saving to Supabase if user is logged in
    if (user && user.id !== 'demo-123') {
      try {
        await supabase.from('quiz_history').insert({
          id: newRecord.id,
          user_id: user.id,
          quiz_type: newRecord.quizType,
          quiz_context: newRecord.quizContext,
          total_expected: newRecord.totalExpected,
          total_selected: newRecord.totalSelected,
          completed_at: newRecord.completedAt,
        });
      } catch (err) {
        // Table might not exist or network error, local persistence guarantees user data
        console.warn('Could not sync quiz record to Supabase, saved locally:', err);
      }
    }

    return newRecord;
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(getStorageKey());
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear quiz history:', e);
    }
  };

  const deleteAttempt = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update quiz history:', e);
      }
      return updated;
    });
  };

  return {
    history,
    isLoading,
    saveQuizAttempt,
    clearHistory,
    deleteAttempt,
    refreshHistory: loadHistory,
  };
}
