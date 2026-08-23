'use client';

import { motion } from 'framer-motion';
import { BookOpen, FileText, MessageSquare, Quote, Shield } from 'lucide-react';

interface AchievementCardProps {
  totalWords: number;
  totalSnippets: number;
  totalThreads: number;
  totalDocuments: number;
  badgeIds: string[];
}

export function AchievementCard({
  totalWords,
  totalSnippets,
  totalThreads,
  totalDocuments,
  badgeIds
}: AchievementCardProps) {
  const achievements = [
    { label: 'Words', value: totalWords, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Snippet', value: totalSnippets, icon: Quote, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Thread', value: totalThreads, icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Document', value: totalDocuments, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-surface border border-border hover:border-border-hover transition-colors"
    >
      <div className="flex justify-around items-center">
        {achievements.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${item.bg} mb-3`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <span className="text-xl font-bold text-foreground">{item.value}</span>
            <span className="text-sm text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      {badgeIds.length > 0 && (
        <>
          <div className="h-px w-full bg-border my-6"></div>
          <div className="flex justify-center space-x-3">
            {badgeIds.map((badge, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
