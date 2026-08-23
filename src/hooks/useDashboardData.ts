import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RecentItem } from '@/components/home/RecentItemsList';

export interface DashboardData {
  achievements: {
    totalWords: number;
    totalSnippets: number;
    totalThreads: number;
    totalDocuments: number;
    badgeIds: string[];
  };
  weeklyActivity: {
    activityLevels: number[];
    totalLearningDays: number;
    totalWordsLearned: number;
    totalReviewSessions: number;
    dailyGoal: number;
  };
  todayActivity: {
    wordsAdded: number;
    quizScore: string;
  };
  recentWords: RecentItem[];
  recentDocs: RecentItem[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  
  const [data, setData] = useState<Omit<DashboardData, 'isLoading' | 'error'>>({
    achievements: {
      totalWords: 0,
      totalSnippets: 0,
      totalThreads: 0,
      totalDocuments: 0,
      badgeIds: [],
    },
    weeklyActivity: {
      activityLevels: [0, 0, 0, 0, 0, 0, 0],
      totalLearningDays: 0,
      totalWordsLearned: 0,
      totalReviewSessions: 0,
      dailyGoal: 20,
    },
    todayActivity: {
      wordsAdded: 0,
      quizScore: '-',
    },
    recentWords: [],
    recentDocs: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);

      try {
        if (user.id === 'demo-123') {
          setIsLoading(false);
          return;
        }

        // Fetch Vocabularies
        const { data: vocabData, error: vocabError } = await supabase
          .from('vocabularies')
          .select('id, word, created_at')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (vocabError) throw vocabError;

        // Fetch Documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('id, title, doc_type, created_at')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (docsError) throw docsError;

        // Process Achievements
        const totalWords = vocabData?.length || 0;
        let totalSnippets = 0;
        let totalThreads = 0;
        let totalDocuments = 0;

        docsData?.forEach((doc) => {
          if (doc.doc_type === 'snippet') totalSnippets++;
          else if (doc.doc_type === 'thread') totalThreads++;
          else totalDocuments++;
        });

        // Process Weekly Heatmap
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const activityCounts = [0, 0, 0, 0, 0, 0, 0];
        let weeklyWordsLearned = 0;
        let wordsAddedToday = 0;

        vocabData?.forEach((vocab) => {
          const date = new Date(vocab.created_at);
          // Today's activity
          if (date.toDateString() === now.toDateString()) {
            wordsAddedToday++;
          }
          // Weekly activity
          if (date >= startOfWeek) {
            const dayIndex = (date.getDay() + 6) % 7; // Mon = 0, Sun = 6
            if (dayIndex >= 0 && dayIndex <= 6) {
              activityCounts[dayIndex]++;
              weeklyWordsLearned++;
            }
          }
        });

        docsData?.forEach((doc) => {
          const date = new Date(doc.created_at);
          if (date >= startOfWeek) {
            const dayIndex = (date.getDay() + 6) % 7;
            if (dayIndex >= 0 && dayIndex <= 6) {
              activityCounts[dayIndex]++;
            }
          }
        });

        const totalLearningDays = activityCounts.filter((c) => c > 0).length;
        const activityLevels = activityCounts.map((count) => {
          if (count === 0) return 0;
          if (count <= 2) return 1;
          if (count <= 5) return 2;
          if (count <= 10) return 3;
          return 4;
        });

        // Process Recent Items
        const recentWords = (vocabData || []).slice(0, 5).map((vocab) => {
          const d = new Date(vocab.created_at);
          const diffMs = now.getTime() - d.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHrs / 24);
          
          let dateStr = '';
          if (diffHrs < 24) dateStr = diffHrs === 0 ? 'Just now' : `${diffHrs} hours ago`;
          else dateStr = `${diffDays} days ago`;

          return {
            id: vocab.id,
            title: vocab.word,
            type: 'Word' as const,
            date: dateStr,
            status: 'Learning' as const, // We don't have syncStatus/mastery fully implemented in schema here
          };
        });

        const recentDocs = (docsData || []).slice(0, 5).map((doc) => {
          const d = new Date(doc.created_at);
          const diffMs = now.getTime() - d.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHrs / 24);
          
          let dateStr = '';
          if (diffHrs < 24) dateStr = diffHrs === 0 ? 'Just now' : `${diffHrs} hours ago`;
          else dateStr = `${diffDays} days ago`;
          
          let docTypeLabel = 'Document';
          if (doc.doc_type === 'snippet') docTypeLabel = 'Snippet';
          else if (doc.doc_type === 'thread') docTypeLabel = 'Thread';

          return {
            id: doc.id,
            title: doc.title || 'Untitled',
            type: docTypeLabel as any,
            date: dateStr,
            status: 'Learning' as const,
          };
        });

        setData({
          achievements: {
            totalWords,
            totalSnippets,
            totalThreads,
            totalDocuments,
            badgeIds: [], // Badges not implemented in DB schema yet
          },
          weeklyActivity: {
            activityLevels,
            totalLearningDays,
            totalWordsLearned: weeklyWordsLearned,
            totalReviewSessions: 0,
            dailyGoal: 20,
          },
          todayActivity: {
            wordsAdded: wordsAddedToday,
            quizScore: '-', // Quiz history not in DB yet
          },
          recentWords,
          recentDocs,
        });

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return { ...data, isLoading, error };
}
