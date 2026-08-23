'use client';

import { motion } from 'framer-motion';
import { History, Trophy } from 'lucide-react';

interface HistoryCardsProps {
  wordsValueStr: string;
  quizValueStr: string;
  onWordsTap: () => void;
  onQuizTap: () => void;
}

export function HistoryCards({ wordsValueStr, quizValueStr, onWordsTap, onQuizTap }: HistoryCardsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-blue-500 tracking-widest mb-4 px-2 uppercase">Today's Activity</h2>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onWordsTap}
          className="p-5 rounded-2xl bg-surface border border-border hover:border-blue-500/30 cursor-pointer flex flex-col items-center justify-center text-center transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
            <History className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-foreground mb-1">{wordsValueStr}</span>
          <span className="text-xs text-muted">Words Added</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onQuizTap}
          className="p-5 rounded-2xl bg-surface border border-border hover:border-purple-500/30 cursor-pointer flex flex-col items-center justify-center text-center transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-3xl font-bold text-foreground mb-1">{quizValueStr}</span>
          <span className="text-xs text-muted">Quiz Score</span>
        </motion.div>
      </div>
    </div>
  );
}
