'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { AchievementCard } from '@/components/home/AchievementCard';
import { ContextAwareActionCard } from '@/components/home/ContextAwareActionCard';
import { RecentItemsList } from '@/components/home/RecentItemsList';
import { CollectionsGrid } from '@/components/home/CollectionsGrid';
import { LearningInsights } from '@/components/home/LearningInsights';
import { HistoryCards } from '@/components/home/HistoryCards';
import { ReminderBanner } from '@/components/home/ReminderBanner';
import { WeeklyHeatmap } from '@/components/home/WeeklyHeatmap';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    achievements,
    weeklyActivity,
    todayActivity,
    recentWords,
    recentDocs,
    isLoading,
    error
  } = useDashboardData();

  // Reminders/Insights/Collections are not yet supported in the Supabase schema, 
  // so we keep them empty to ensure no fake mock data is shown.
  const [reminders, setReminders] = useState<any[]>([]);
  const collections: any[] = [];
  const insights: any[] = [];

  const handleDismissReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          Failed to load dashboard data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pt-24 md:pt-28 pb-24 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column (Main Content) */}
        <div className="xl:col-span-2 space-y-10">

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <AchievementCard {...achievements} />
          </motion.div>

          <AnimatePresence>
            {reminders.length > 0 && (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <ReminderBanner
                    key={reminder.id}
                    reminder={reminder}
                    onAction={() => handleDismissReminder(reminder.id)}
                    onDismiss={() => handleDismissReminder(reminder.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {recentWords.length > 0 && (
            <RecentItemsList title="Recently Added" items={recentWords} onViewAll={() => { }} />
          )}

          {recentDocs.length > 0 && (
            <RecentItemsList title="Recent Documents" items={recentDocs} onViewAll={() => { }} />
          )}

          {collections.length > 0 && (
            <CollectionsGrid collections={collections} onViewAll={() => { }} />
          )}

        </div>

        {/* Right Column (Sidebar / Context) */}
        <div className="space-y-10">

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <ContextAwareActionCard reviewDueCount={0} onActionPressed={() => { }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <HistoryCards
              wordsValueStr={`${todayActivity.wordsAdded}/${weeklyActivity.dailyGoal}`}
              quizValueStr={todayActivity.quizScore}
              onWordsTap={() => { }}
              onQuizTap={() => { }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <WeeklyHeatmap {...weeklyActivity} />
          </motion.div>

          {insights.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <LearningInsights insights={insights} />
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
