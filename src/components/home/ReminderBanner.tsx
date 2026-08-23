'use client';

import { motion } from 'framer-motion';
import { BookOpen, RefreshCw, X } from 'lucide-react';

export interface Reminder {
  id: string;
  title: string;
  message: string;
  type: 'words' | 'learn';
  isRead: boolean;
}

interface ReminderBannerProps {
  reminder: Reminder;
  onAction: () => void;
  onDismiss: () => void;
}

export function ReminderBanner({ reminder, onAction, onDismiss }: ReminderBannerProps) {
  const isWords = reminder.type === 'words';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      className={`p-4 rounded-2xl border mb-4 relative overflow-hidden flex items-center shadow-lg ${isWords ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
        }`}
    >
      <div className={`p-3 rounded-full mr-4 ${isWords ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
        }`}>
        {isWords ? <BookOpen className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
      </div>

      <div className="flex-1 pr-4">
        <h4 className="text-foreground font-bold mb-1">{reminder.title}</h4>
        <p className={`text-sm ${isWords ? 'text-amber-200/80' : 'text-emerald-200/80'}`}>
          {reminder.message}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onAction}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isWords
              ? 'bg-amber-500 text-amber-950 hover:bg-amber-400'
              : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
            }`}
        >
          {isWords ? 'Add Words' : 'Review Now'}
        </button>
        <button
          onClick={onDismiss}
          className={`p-2 rounded-full transition-colors ${isWords
              ? 'hover:bg-amber-500/20 text-amber-500/60 hover:text-amber-500'
              : 'hover:bg-emerald-500/20 text-emerald-500/60 hover:text-emerald-500'
            }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
