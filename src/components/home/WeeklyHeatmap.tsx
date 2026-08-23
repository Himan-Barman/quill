'use client';

import { motion } from 'framer-motion';

interface WeeklyHeatmapProps {
  activityLevels: number[]; // Array of 7 numbers (0 to 4)
  totalLearningDays: number;
  totalWordsLearned: number;
  totalReviewSessions: number;
  dailyGoal: number;
}

export function WeeklyHeatmap({
  activityLevels,
  totalLearningDays,
  totalWordsLearned,
  totalReviewSessions
}: WeeklyHeatmapProps) {

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Mapping activity level to color intensity
  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-surface border-border';
      case 1: return 'bg-blue-900 border-blue-800';
      case 2: return 'bg-blue-700 border-blue-600';
      case 3: return 'bg-blue-500 border-blue-400';
      case 4: return 'bg-blue-400 border-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]';
      default: return 'bg-surface border-border';
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4 px-2">Activity Overview</h2>

      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Heatmap */}
          <div className="w-full flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted mb-3 self-start">Last 7 Days</h3>
            <div className="flex items-center space-x-3 w-full justify-between">
              {activityLevels.map((level, i) => (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className={`w-10 h-10 rounded-lg border ${getColor(level)} transition-all`}
                  />
                  <span className="text-xs text-muted mt-2 font-medium">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
